import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, ChevronLeft, ChevronRight, Lightbulb, X } from "lucide-react";
import { MinecraftHeading } from "@/components/MinecraftHeading";
import { UploadDropzone } from "@/components/UploadDropzone";

interface ExtractedData {
  [page: string]: string;
}

const INDIAN_LANGUAGES = [
  "Assamese",
  "Bengali",
  "Bodo",
  "Dogri",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri (Meitei)",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Santhali",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu"
];

// Mapping of language names to language codes for the backend
const LANGUAGE_CODE_MAP: { [key: string]: string } = {
  "Assamese": "as",
  "Bengali": "bn",
  "Bodo": "brx",
  "Dogri": "doi",
  "Gujarati": "gu",
  "Hindi": "hi",
  "Kannada": "kn",
  "Kashmiri": "ks",
  "Konkani": "kok",
  "Maithili": "mai",
  "Malayalam": "ml",
  "Manipuri (Meitei)": "mni",
  "Marathi": "mr",
  "Nepali": "ne",
  "Odia": "or",
  "Punjabi": "pa",
  "Sanskrit": "sa",
  "Santhali": "sat",
  "Sindhi": "sd",
  "Tamil": "ta",
  "Telugu": "te",
  "Urdu": "ur"
};

const OCR = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [currentPage, setCurrentPage] = useState<string>("1");
  const [error, setError] = useState("");
  const [localApiUrl, setLocalApiUrl] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupDisplayedContent, setPopupDisplayedContent] = useState("");
  const [isPopupTyping, setIsPopupTyping] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Hindi");
  const [pendingAction, setPendingAction] = useState<"explain" | "summarize" | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.json");
        if (response.ok) {
          const config = await response.json();
          if (config.localapi) {
            setLocalApiUrl(config.localapi);
          }
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        setError("Failed to load API configuration");
      }
    };
    loadConfig();
  }, []);

  // Typing animation for popup content
  useEffect(() => {
    if (!popupContent || isPopupTyping) return;

    setIsPopupTyping(true);
    setPopupDisplayedContent("");
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < popupContent.length) {
        setPopupDisplayedContent(popupContent.substring(0, index + 1));
        index++;
      } else {
        setIsPopupTyping(false);
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [popupContent]);

  // Debug language dialog changes
  useEffect(() => {
    console.log("showLanguageDialog changed to:", showLanguageDialog);
  }, [showLanguageDialog]);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setError("");
    setExtractedData({});
    setCurrentPage("1");
  };

  const handleExtractData = async () => {
    if (files.length === 0) return;
    if (!localApiUrl) {
      setError("API URL not loaded. Please refresh the page.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setExtractedData({});

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch(`${localApiUrl}ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR failed: ${response.statusText}`);
      }

      const data: ExtractedData = await response.json();
      setExtractedData(data);
      setCurrentPage("1");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extract text from document";
      setError(errorMessage);
      console.error("OCR Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExplain = () => {
    console.log("handleExplain called");
    console.log("Current showLanguageDialog:", showLanguageDialog);
    console.log("Current pendingAction:", pendingAction);
    setPendingAction("explain");
    setShowLanguageDialog(true);
    console.log("After setState - Language dialog should now be visible");
  };

  const executeExplain = async (language: string) => {
    if (!localApiUrl) {
      setError("API URL not loaded.");
      return;
    }

    setIsExplaining(true);
    const message = `Explain the file data below\n\n${extractedData[currentPage]}`;
    const languageCode = LANGUAGE_CODE_MAP[language];
    
    console.log("Language selected:", language);
    console.log("Language code mapped:", languageCode);
    console.log("Sending request with language code:", languageCode);

    try {
      const response = await fetch(`${localApiUrl}explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, language: languageCode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Explain response status: ${response.status}`, errorText);
        throw new Error(`Explain failed (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log("Explain API Response:", responseText);
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
        console.log("Setting popup content to:", data.response);
        setPopupContent(data.response || "No response received");
        setPopupDisplayedContent("");
        setShowPopup(true);
        console.log("Popup should be visible now");
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr);
        setError("Failed to parse response from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to explain data";
      setError(errorMessage);
      console.error("Explain Error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSummarize = () => {
    console.log("handleSummarize called");
    console.log("Current showLanguageDialog:", showLanguageDialog);
    console.log("Current pendingAction:", pendingAction);
    setPendingAction("summarize");
    setShowLanguageDialog(true);
    console.log("After setState - Language dialog should now be visible");
  };

  const executeSummarize = async (language: string) => {
    if (!localApiUrl) {
      setError("API URL not loaded.");
      return;
    }

    setIsExplaining(true);
    const allData = Object.values(extractedData).join("\n\n");
    const message = `summarize the full data below and explain in short\n\n${allData}`;
    const languageCode = LANGUAGE_CODE_MAP[language];
    
    console.log("Summarize endpoint URL:", `${localApiUrl}explain`);
    console.log("Request payload:", { message, language: languageCode });

    try {
      const response = await fetch(`${localApiUrl}explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, language: languageCode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Summarize response status: ${response.status}`, errorText);
        throw new Error(`Summarize failed (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log("Summarize API Response:", responseText);
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
        console.log("Setting popup content to:", data.response);
        setPopupContent(data.response || "No response received");
        setPopupDisplayedContent("");
        setShowPopup(true);
        console.log("Popup should be visible now");
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr);
        setError("Failed to parse response from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to summarize data";
      setError(errorMessage);
      console.error("Summarize Error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleClearFiles = () => {
    setFiles([]);
    setExtractedData({});
    setCurrentPage("1");
    setError("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupContent("");
    setPopupDisplayedContent("");
  };

  const pages = Object.keys(extractedData).sort((a, b) => Number(a) - Number(b));
  const currentPageIndex = pages.indexOf(currentPage);
  const hasData = Object.keys(extractedData).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <MinecraftHeading className="text-2xl md:text-3xl mb-2">
          OCR & Forms
        </MinecraftHeading>
        <p className="text-muted-foreground">
          Upload documents for instant text extraction and analysis
        </p>
      </div>

      {/* Upload Section */}
      <Card className="pixel-border">
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Supported formats: PDF, JPG, PNG, WEBP, PDF, DOCX 
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <>
              <UploadDropzone onFilesAdded={handleFilesAdded} />

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{files[0].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(files[0].size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleExtractData}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Extract Data
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearFiles}
                      variant="outline"
                      disabled={isAnalyzing}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasData && (
        <div className="grid grid-cols-1 gap-6">
          {/* Extracted Data Display */}
          <Card className="pixel-border">
            <CardHeader>
              <CardTitle>Extracted Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Page Content */}
              <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto border">
                {extractedData[currentPage] || "No content"}
              </div>

              {/* Pagination and Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevIndex = Math.max(0, currentPageIndex - 1);
                    setCurrentPage(pages[prevIndex]);
                  }}
                  disabled={currentPageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium">
                  Page {currentPage} of {pages[pages.length - 1]}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="flex items-center gap-2"
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Explaining...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4" />
                      Explain
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextIndex = Math.min(pages.length - 1, currentPageIndex + 1);
                    setCurrentPage(pages[nextIndex]);
                  }}
                  disabled={currentPageIndex === pages.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleSummarize}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Summarizing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFiles}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 flex flex-col pixel-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle>Response</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePopup}
                className="p-0 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="font-mono text-sm whitespace-pre-wrap break-words">
                {popupDisplayedContent || "Loading..."}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Language Selection Dialog */}
      {showLanguageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl flex flex-col pixel-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle>Select Language</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageDialog(false)}
                className="p-0 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Choose the language for the response
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {INDIAN_LANGUAGES.map((language) => (
                  <Button
                    key={language}
                    variant={selectedLanguage === language ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedLanguage(language)}
                  >
                    {language}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-4 mt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowLanguageDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setShowLanguageDialog(false);
                    if (pendingAction === "explain") {
                      await executeExplain(selectedLanguage);
                    } else if (pendingAction === "summarize") {
                      await executeSummarize(selectedLanguage);
                    }
                    setPendingAction(null);
                  }}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OCR;
