import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Upload, FileCheck, AlertTriangle, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Camera, Video, Lock, Eye, EyeOff } from "lucide-react";

const AGE_KEY = "ramen_anime_age_verified_v2";
const ID_KEY = "ramen_anime_id_verified";
const SELFIE_KEY = "ramen_anime_selfie_verified";
const CODES = ["Alpha-7-9-3", "Beta-2-4-8", "Gamma-1-5-9", "Delta-3-7-2", "Echo-4-1-6", "Fox-8-2-5", "Neo-9-0-1", "Zen-5-6-3"];

export default function EnhancedAgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [idDocUrl, setIdDocUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [livenessUrl, setLivenessUrl] = useState("");
  const [randomCode] = useState(() => CODES[Math.floor(Math.random() * CODES.length)]);
  const [showId, setShowId] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const submitAge = trpc.geo.submitAgeVerification.useMutation({
    onSuccess: () => { localStorage.setItem(AGE_KEY, "true"); setProgress(25); setStep(1); setError(""); },
    onError: (err) => setError(err.message),
  });

  const submitId = trpc.geo.submitIdVerification.useMutation({
    onSuccess: () => { localStorage.setItem(ID_KEY, "true"); setProgress(75); setStep(2); setError(""); },
    onError: (err) => setError(err.message),
  });

  const verifyAge = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError(t("ageGate.error", { defaultValue: "You must be 18 or older." }));
      return;
    }
    submitAge.mutate({ age: ageNum });
  };

  const handleIdUpload = () => {
    if (!idDocUrl.trim() || !selfieUrl.trim() || !fullName.trim() || !dob.trim()) {
      setError("Please provide all required information.");
      return;
    }
    submitId.mutate({ idDocumentUrl: idDocUrl, selfieUrl: selfieUrl, idNumberHash: idNumber ? btoa(idNumber) : undefined, fullName, dateOfBirth: dob });
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setLivenessUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Camera access denied.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const finish = () => {
    localStorage.setItem(SELFIE_KEY, "true");
    setStep(3);
    setProgress(100);
  };

  const allVerified = localStorage.getItem(AGE_KEY) === "true" && localStorage.getItem(ID_KEY) === "true" && localStorage.getItem(SELFIE_KEY) === "true";
  if (allVerified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[150] bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl py-8">
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto">ラ</div>
              <h1 className="text-2xl font-bold text-foreground">{t("ageGate.title")}</h1>
              <p className="text-sm text-muted-foreground">Multi-step identity verification required</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge variant={step >= 0 ? "default" : "outline"} className={step >= 0 ? "bg-primary text-primary-foreground" : ""}>Age</Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant={step >= 1 ? "default" : "outline"} className={step >= 1 ? "bg-primary text-primary-foreground" : ""}>ID</Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant={step >= 2 ? "default" : "outline"} className={step >= 2 ? "bg-primary text-primary-foreground" : ""}>Liveness</Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant={step >= 3 ? "default" : "outline"} className={step >= 3 ? "bg-primary text-primary-foreground" : ""}>Done</Badge>
              </div>
              <Progress value={progress} className="h-2 w-full max-w-xs mx-auto" />
            </div>

            {error && <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}

            {step === 0 && (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Why we verify:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>USA: COPPA & CCPA</li><li>Canada: PIPEDA</li><li>Japan: APPI</li>
                    <li>South Korea: Youth Protection Act</li><li>China: PIPL real-name</li><li>France/EU: GDPR</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Enter your age</label>
                  <Input type="number" value={age} onChange={(e) => { setAge(e.target.value); setError(""); }} placeholder="18" min="1" max="120" className="bg-muted/50" />
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={verifyAge} disabled={submitAge.isPending}>
                    {submitAge.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    {submitAge.isPending ? "Verifying..." : "Confirm Age & Continue"}
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = "https://google.com"}>Exit</Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-foreground"><strong>China PIPL / South Korea PIPA:</strong> Upload government-issued ID + selfie holding ID.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground flex items-center gap-2"><FileCheck className="h-4 w-4 text-primary" />Full Name</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" className="bg-muted/50" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Date of Birth</label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-muted/50" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />ID Number {showId ? <EyeOff className="h-3 w-3 ml-auto cursor-pointer" onClick={() => setShowId(false)} /> : <Eye className="h-3 w-3 ml-auto cursor-pointer" onClick={() => setShowId(true)} />}</label>
                  <Input type={showId ? "text" : "password"} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter ID number" className="bg-muted/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground flex items-center gap-2"><Upload className="h-4 w-4 text-primary" />ID Document URL</label><Input value={idDocUrl} onChange={(e) => setIdDocUrl(e.target.value)} placeholder="https://..." className="bg-muted/50 text-xs" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground flex items-center gap-2"><Camera className="h-4 w-4 text-primary" />Selfie with ID URL</label><Input value={selfieUrl} onChange={(e) => setSelfieUrl(e.target.value)} placeholder="https://..." className="bg-muted/50 text-xs" /></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleIdUpload} disabled={submitId.isPending}>{submitId.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}{submitId.isPending ? "Uploading..." : "Submit ID Documents"}</Button>
                  <Button variant="outline" onClick={() => setStep(0)}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"><p className="text-sm text-foreground"><strong>Liveness Detection:</strong> Record a 5-second video saying the code below.</p></div>
                <div className="text-center space-y-3"><p className="text-sm text-muted-foreground">Say this code out loud:</p><div className="inline-block px-6 py-3 rounded-lg bg-primary/10 border border-primary/20"><p className="text-2xl font-bold text-primary tracking-widest">{randomCode}</p></div></div>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden"><video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />{isRecording && <div className="absolute top-3 right-3 flex items-center gap-2 bg-destructive/80 text-white px-3 py-1 rounded-full text-xs"><div className="w-2 h-2 bg-white rounded-full animate-pulse" />Recording...</div>}</div>
                <div className="flex flex-col sm:flex-row gap-3">{!isRecording ? <Button onClick={startRecording} className="bg-primary text-primary-foreground hover:bg-primary/90"><Video className="mr-2 h-4 w-4" /> Start Recording</Button> : <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>}</div>
                {livenessUrl && <div className="space-y-3"><p className="text-sm text-muted-foreground">Video recorded successfully.</p><Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={finish}><CheckCircle2 className="mr-2 h-4 w-4" /> Complete Verification</Button></div>}
                <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"><CheckCircle2 className="h-10 w-10 text-green-500" /></div>
                <h2 className="text-xl font-bold text-foreground">Verification Submitted</h2>
                <p className="text-muted-foreground">Your documents are under review. Typically 24-48 hours.</p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/")}>Return to Homepage</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
