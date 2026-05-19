import { useParams, Link } from "react-router";

import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Music, Heart, MapPin, Link as LinkIcon, Edit3, UserPlus, UserCheck,
  MessageSquare, Globe, Gamepad2, Tv, Smile, Send, Loader2, Wallet,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ProfileEarnings from "@/components/profile/ProfileEarnings";
import TosGate from "@/components/TosGate";
import { toast } from "sonner";

function ProfileContent() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const profileUserId = parseInt(id ?? "0");
  
  const { user: me, isAuthenticated } = useAuth();
  const isMyProfile = isAuthenticated && me?.id === profileUserId;
  const [editOpen, setEditOpen] = useState(false);

  const { data: profile, isLoading } = trpc.social.getProfile.useQuery(
    { userId: profileUserId },
    { enabled: profileUserId > 0, staleTime: 30000 }
  );

  const { data: friendsList } = trpc.social.listFriends.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const utils = trpc.useUtils();

  const updateProfile = trpc.social.createOrUpdateProfile.useMutation({
    onSuccess: (result) => {
      toast.success(t("profile.saveSuccess"));
      setEditOpen(false);
      utils.social.getProfile.setData({ userId: profileUserId }, result);
      utils.social.getMyProfile.setData(undefined, result);
      void utils.social.getProfile.invalidate({ userId: profileUserId });
    },
    onError: (err) => {
      toast.error(t("profile.saveFailed", { message: err.message }));
    },
  });

  const handleSave = useCallback((data: Record<string, string>) => {
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== "" && value !== undefined) {
        payload[key] = value;
      }
    }
    updateProfile.mutate(payload);
  }, [updateProfile]);

  const sendFriendRequest = trpc.social.sendFriendRequest.useMutation({
    onSuccess: () => { utils.social.listFriends.invalidate(); toast.success(t("profile.friendRequestSent")); },
    onError: (err) => toast.error(err.message),
  });

  const isFriend = friendsList?.some((f: any) => f.id === profileUserId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isMyProfile ? t("profile.welcome") : t("profile.notFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isMyProfile ? t("profile.createProfile") : t("profile.noProfile")}
          </p>
          {isMyProfile && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Edit3 className="mr-2 h-5 w-5" />
                  {t("profile.setupBtn")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{t("profile.createTitle")}</DialogTitle></DialogHeader>
                <ProfileEditForm onSave={handleSave} isPending={updateProfile.isPending} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    );
  }

  const bgColor = profile.backgroundColor ?? "#0a0a0a";
  const textColor = profile.textColor ?? "#e5e5e5";
  const accentColor = profile.accentColor ?? "#d4a853";

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: bgColor }}>
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden mb-6 border" style={{ borderColor: accentColor + "40" }}>
          {profile.backgroundImage && (
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${profile.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 shrink-0" style={{ borderColor: accentColor }}>
                <AvatarImage src={profile.user?.avatar ?? undefined} />
                <AvatarFallback className="text-3xl" style={{ backgroundColor: accentColor + "20", color: accentColor }}>
                  {profile.user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: textColor }}>
                  {profile.displayName ?? profile.user?.name ?? "User"}
                </h1>
                {profile.headline && <p className="text-lg mb-3" style={{ color: accentColor }}>"{profile.headline}"</p>}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm" style={{ color: textColor + "99" }}>
                  {profile.mood && <span className="flex items-center gap-1"><Smile className="h-4 w-4" style={{ color: accentColor }} />{profile.mood}</span>}
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" style={{ color: accentColor }} />{profile.location}</span>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: accentColor }}><LinkIcon className="h-4 w-4" />Website</a>}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                  {isMyProfile ? (
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" style={{ borderColor: accentColor + "60", color: accentColor }}>
                          <Edit3 className="mr-1 h-4 w-4" />{t("profile.editBtn")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{t("profile.editTitle")}</DialogTitle></DialogHeader>
                        <ProfileEditForm profile={profile} onSave={handleSave} isPending={updateProfile.isPending} />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <>
                      {isAuthenticated && !isFriend && (
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => sendFriendRequest.mutate({ addresseeId: profileUserId })} disabled={sendFriendRequest.isPending}>
                          <UserPlus className="mr-1 h-4 w-4" />{t("profile.addFriend")}
                        </Button>
                      )}
                      {isFriend && <Badge variant="outline" className="border-primary/30 text-primary"><UserCheck className="mr-1 h-4 w-4" />{t("profile.friends")}</Badge>}
                      <Link to="/messages"><Button size="sm" variant="outline" style={{ borderColor: accentColor + "60", color: accentColor }}><MessageSquare className="mr-1 h-4 w-4" />{t("profile.message", { defaultValue: "Message" })}</Button></Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: accentColor }}><Heart className="h-5 w-5" />{t("profile.aboutMe")}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textColor + "cc" }}>{profile.aboutMe ?? t("profile.noBio")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: accentColor }}><Globe className="h-5 w-5" />{t("profile.interests")}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textColor + "cc" }}>{profile.interests ?? t("profile.noInterests")}</p>
              </CardContent>
            </Card>
            {profile.profileSong && (
              <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: accentColor }}><Music className="h-5 w-5" />{t("profile.profileSong")}</h3>
                  <p className="text-sm font-medium" style={{ color: textColor }}>{profile.profileSong}</p>
                  {profile.profileSongUrl && <a href={profile.profileSongUrl} target="_blank" rel="noopener noreferrer" className="text-sm mt-2 inline-block hover:underline" style={{ color: accentColor }}>{t("profile.listen")} →</a>}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
                <CardContent className="p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: accentColor }}><Tv className="h-5 w-5" />{t("profile.favAnime")}</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textColor + "cc" }}>{profile.favoriteAnime ?? t("profile.noFavorites")}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
                <CardContent className="p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: accentColor }}><Gamepad2 className="h-5 w-5" />{t("profile.favGames")}</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textColor + "cc" }}>{profile.favoriteGames ?? t("profile.noFavorites")}</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: accentColor }}><MessageSquare className="h-5 w-5" />{t("profile.recentPosts")}</h3>
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: textColor + "80" }}>{t("profile.forumPostsPlaceholder")}</p>
                  <Link to="/social"><Button size="sm" className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90">{t("profile.viewForum")}</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileEditForm({ profile, onSave, isPending }: { profile?: Record<string, string>; onSave: (data: Record<string, string>) => void; isPending: boolean }) {
  const { t } = useTranslation();
  const defaults = profile ?? {};
  const [form, setForm] = useState({
    displayName: defaults.displayName ?? "",
    headline: defaults.headline ?? "",
    aboutMe: defaults.aboutMe ?? "",
    interests: defaults.interests ?? "",
    favoriteAnime: defaults.favoriteAnime ?? "",
    favoriteGames: defaults.favoriteGames ?? "",
    profileSong: defaults.profileSong ?? "",
    profileSongUrl: defaults.profileSongUrl ?? "",
    backgroundColor: defaults.backgroundColor ?? "#0a0a0a",
    backgroundImage: defaults.backgroundImage ?? "",
    textColor: defaults.textColor ?? "#e5e5e5",
    accentColor: defaults.accentColor ?? "#d4a853",
    mood: defaults.mood ?? "",
    location: defaults.location ?? "",
    website: defaults.website ?? "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = () => onSave(form);

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium mb-1 block">Display Name</label><Input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} className="bg-muted/50" /></div>
        <div><label className="text-xs font-medium mb-1 block">Headline</label><Input value={form.headline} onChange={(e) => update("headline", e.target.value)} className="bg-muted/50" /></div>
      </div>
      <div><label className="text-xs font-medium mb-1 block">About Me</label><Textarea value={form.aboutMe} onChange={(e) => update("aboutMe", e.target.value)} rows={3} className="bg-muted/50" /></div>
      <div><label className="text-xs font-medium mb-1 block">Interests</label><Textarea value={form.interests} onChange={(e) => update("interests", e.target.value)} rows={2} className="bg-muted/50" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium mb-1 block">Favorite Anime</label><Input value={form.favoriteAnime} onChange={(e) => update("favoriteAnime", e.target.value)} className="bg-muted/50" /></div>
        <div><label className="text-xs font-medium mb-1 block">Favorite Games</label><Input value={form.favoriteGames} onChange={(e) => update("favoriteGames", e.target.value)} className="bg-muted/50" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium mb-1 block">Profile Song</label><Input value={form.profileSong} onChange={(e) => update("profileSong", e.target.value)} className="bg-muted/50" /></div>
        <div><label className="text-xs font-medium mb-1 block">Song URL</label><Input value={form.profileSongUrl} onChange={(e) => update("profileSongUrl", e.target.value)} className="bg-muted/50" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium mb-1 block">Background</label><div className="flex gap-2"><Input value={form.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} className="bg-muted/50" /><div className="w-8 h-9 rounded border shrink-0" style={{ backgroundColor: form.backgroundColor }} /></div></div>
        <div><label className="text-xs font-medium mb-1 block">Text Color</label><div className="flex gap-2"><Input value={form.textColor} onChange={(e) => update("textColor", e.target.value)} className="bg-muted/50" /><div className="w-8 h-9 rounded border shrink-0" style={{ backgroundColor: form.textColor }} /></div></div>
        <div><label className="text-xs font-medium mb-1 block">Accent</label><div className="flex gap-2"><Input value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="bg-muted/50" /><div className="w-8 h-9 rounded border shrink-0" style={{ backgroundColor: form.accentColor }} /></div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium mb-1 block">Mood</label><Input value={form.mood} onChange={(e) => update("mood", e.target.value)} className="bg-muted/50" /></div>
        <div><label className="text-xs font-medium mb-1 block">Location</label><Input value={form.location} onChange={(e) => update("location", e.target.value)} className="bg-muted/50" /></div>
      </div>
      <div><label className="text-xs font-medium mb-1 block">Website</label><Input value={form.website} onChange={(e) => update("website", e.target.value)} className="bg-muted/50" /></div>
      <div><label className="text-xs font-medium mb-1 block">Background Image URL</label><Input value={form.backgroundImage} onChange={(e) => update("backgroundImage", e.target.value)} className="bg-muted/50" placeholder="https://..." /></div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isPending} onClick={onSubmit}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isPending ? t("profile.saving") : t("profile.saveBtn")}
      </Button>
    </div>
  );
}

export default function Profile() {
  return (
    <TosGate>
      <ProfileContent />
    </TosGate>
  );
}
