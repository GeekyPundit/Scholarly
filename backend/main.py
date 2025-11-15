from flask import Flask, redirect, request, jsonify, make_response, url_for
from flask_cors import CORS
import os
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

from database import init_db, get_db, save_chat_message, get_chat_history, delete_chat_history
from auth_session import create_session, get_user_from_session, delete_session

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True)

init_db()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
PORT = int(os.getenv("PORT", 5000))
REDIRECT_URI = os.getenv("REDIRECT_URI")
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@app.get("/")
def test():
    return {"msg": "Backend running"}


@app.get("/login")
def google_login():
    redirect_uri = REDIRECT_URI or url_for("google_callback", _external=True)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return redirect(auth_url)


@app.get("/auth/callback")
def google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No authorization code received"}), 400

    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI or url_for("google_callback", _external=True),
        "grant_type": "authorization_code",
    }

    token_resp = requests.post(GOOGLE_TOKEN_URL, data=token_data)
    try:
        token_json = token_resp.json()
    except Exception:
        return jsonify({"error": "Invalid token response"}), 400

    if token_json.get("error"):
        return jsonify({"error": "Failed to get token", "details": token_json}), 400

    access_token = token_json.get("access_token")
    if not access_token:
        return jsonify({"error": "No access token returned"}), 400

    headers = {"Authorization": f"Bearer {access_token}"}
    user_resp = requests.get(GOOGLE_USERINFO_URL, headers=headers)
    try:
        user_info = user_resp.json()
    except Exception:
        return jsonify({"error": "Invalid user info response"}), 400

    if user_info.get("error"):
        return jsonify({"error": "Failed to fetch user info", "details": user_info}), 400

    google_id = str(user_info.get("id", ""))
    email = user_info.get("email", "")
    name = user_info.get("name", "")
    picture = user_info.get("picture", "")

    if not google_id or not email:
        return jsonify({"error": "Missing required user info"}), 400
    conn = get_db()
    conn.execute(
        """
        INSERT OR IGNORE INTO users (id, name, email, picture)
        VALUES (?, ?, ?, ?)
        """,
        (google_id, name, email, picture),
    )
    conn.commit()
    conn.close()
    session_id = create_session(google_id)
    resp = make_response(redirect("https://scholarly.kingmon.xyz/app"))
    resp.set_cookie(
        "session_id",
        session_id,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=False,
        samesite="Lax",
    )
    return resp


@app.get("/user")
def api_user():
    session_id = request.cookies.get("session_id")
    if not session_id:
        return jsonify({"logged_in": False}), 401

    user = get_user_from_session(session_id)
    if not user:
        return jsonify({"logged_in": False}), 401

    return jsonify({"logged_in": True, "user": user})


@app.route("/logout", methods=["GET", "POST"])
def api_logout():
    session_id = request.cookies.get("session_id")
    if session_id:
        delete_session(session_id)
    response = jsonify({"message": "logged out"})
    response.delete_cookie("session_id")
    return response


@app.route("/chat/history", methods=["GET"])
def get_chat_history_endpoint():
    """Get chat history for the current user"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = get_user_from_session(session_id)
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user["id"]
    limit = request.args.get("limit", default=100, type=int)
    
    history = get_chat_history(user_id, limit)
    return jsonify({"chat_history": history}), 200


@app.route("/chat/message", methods=["POST"])
def save_chat_message_endpoint():
    """Save a chat message to history"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = get_user_from_session(session_id)
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    if not data or "message" not in data or "sender" not in data:
        return jsonify({"error": "Missing required fields: message, sender"}), 400

    user_id = user["id"]
    message = data["message"]
    sender = data["sender"]

    save_chat_message(user_id, message, sender)
    return jsonify({"success": True, "message": "Message saved"}), 201


@app.route("/chat/history", methods=["DELETE"])
def delete_chat_history_endpoint():
    """Delete all chat history for the current user"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = get_user_from_session(session_id)
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user["id"]
    delete_chat_history(user_id)
    return jsonify({"success": True, "message": "Chat history deleted"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
