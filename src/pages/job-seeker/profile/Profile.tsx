import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchAnalytics,
  fetchEducations,
  fetchExperiences,
  fetchLanguages,
  fetchMe, fetchProfile,
  fetchSkills,
} from '../../../api/profileApi';
import type { AppDispatch, RootState } from '../../../store';

import {
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Eye,
  Globe2,
  GraduationCap,
  Info,
  LayoutGrid,
  MapPin,
  MoreHorizontal,
  Pencil, Plus,
  Search,
  Sparkles,
  Star,
  User,
  Users,
  Bookmark
} from 'lucide-react';
import EducationDialog from '../../../components/shared/Dialog/Educationdialog';
import ExperienceDialog from '../../../components/shared/Dialog/Experiencedialog';
import LanguageDialog from '../../../components/shared/Dialog/Languagedialog';
import EditProfileDialog from '../../../components/shared/Dialog/ProfileDailog';
import SkillDialog from '../../../components/shared/Dialog/Skilldialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

const Profile = () => {
  const { id: paramId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { me, profile, analytics, experiences, educations, skills, languages, loading } =
    useSelector((s: RootState) => s.profile);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [expDialog, setExpDialog] = useState<{ open: boolean; item? }>({ open: false });
  const [eduDialog, setEduDialog] = useState<{ open: boolean; item? }>({ open: false });
  const [skillOpen, setSkillOpen] = useState(false);
  const [langDialog, setLangDialog] = useState<{ open: boolean; item? }>({ open: false });

  const activeUserId = paramId || (me?.id ? String(me.id) : null);
  const isOwnProfile = !paramId || String(paramId) === String(me?.id);
  const isOrg = profile?.role === 'Organization';

  // Первичный запрос данных о текущем пользователе
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Запрос профиля и связанных сущностей при изменении ID или после закрытия модалки редактирования
  useEffect(() => {
    if (activeUserId) {
      dispatch(fetchProfile(activeUserId));
      dispatch(fetchAnalytics(activeUserId));
      dispatch(fetchExperiences(activeUserId));
      dispatch(fetchEducations(activeUserId));
      dispatch(fetchSkills(activeUserId));
      dispatch(fetchLanguages(activeUserId));
    }
  }, [activeUserId, dispatch, editProfileOpen]); // <-- Добавлен editProfileOpen для реактивного обновления при изменении

  if (loading && !profile) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );

  return (
    <section className='bg-slate-50/50 min-h-screen antialiased text-slate-900'>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* ОСНОВНОЙ КОНТЕНТ */}
          <div className="col-span-12 lg:col-span-8 space-y-5">

            {/* Карточка главного профиля */}
            <Card className="border border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-2xl">
              <div className="relative">
                <div
                  className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90"
                  style={profile?.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />
                {isOwnProfile && (
                  <Button
                    variant="ghost" size="icon"
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-700 rounded-xl shadow-sm backdrop-blur-sm transition-all h-9 w-9 border border-slate-200/50"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <Pencil size={15} />
                  </Button>
                )}
              </div>

              <CardContent className="px-6 pb-6">
                <div className="-mt-14 mb-4 relative z-10 flex items-end justify-between">
                  <div className="relative group p-1 bg-white rounded-2xl shadow-sm border border-slate-100 inline-block">
                    <Avatar className={`h-28 w-28 ${isOrg ? 'rounded-xl' : 'rounded-full'}`}>
                      <AvatarImage src={profile?.avatarUrl} className="object-cover" />
                      <AvatarFallback className={`text-3xl font-black bg-indigo-50 text-indigo-600 ${isOrg ? 'rounded-xl' : ''}`}>
                        {profile?.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <div 
                        className={`absolute inset-1 bg-slate-900/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${isOrg ? 'rounded-xl' : 'rounded-full'}`}
                        onClick={() => setEditProfileOpen(true)}
                      >
                        <Pencil size={20} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                       <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.fullName}</h1>
                       {isOrg && (
                         <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-bold border-none flex gap-1 items-center rounded-lg text-[10px] px-2 py-0.5 shadow-sm">
                           <Sparkles size={11} className="fill-emerald-700/10" /> Verified
                         </Badge>
                       )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-normal">
                      {isOrg ? `${profile?.title || 'Technology'} • 10,001+ employees` : profile?.title || 'No headline added'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2">
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {profile?.location || 'Location not specified'}
                      </p>
                      {isOrg && (
                         <a href="#" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700 transition-colors">
                           <Globe2 size={14} /> Website <ExternalLink size={10} />
                         </a>
                      )}
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" /> <span className="text-slate-700 font-bold">{profile?.connectionsCount || 0}+</span> connections
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
                    {isOwnProfile ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="flex-1 sm:flex-none rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 px-6 shadow-sm text-xs transition-all" onClick={() => setEditProfileOpen(true)}>
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-200 bg-white text-slate-700 font-medium h-10 px-5 text-xs hover:bg-slate-50 transition-all">
                          Add Section
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button className="flex-1 sm:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 px-6 text-xs shadow-sm shadow-indigo-100 transition-all">
                          {isOrg ? '+ Follow' : 'Connect'}
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-200 bg-white text-slate-700 font-medium h-10 px-6 text-xs hover:bg-slate-50 transition-all">
                          {isOrg ? 'Visit website' : 'Message'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isOrg && (
                  <div className="mt-6 border-t border-slate-100 pt-1">
                    <Tabs defaultValue="about" className="w-full">
                      <TabsList className="bg-transparent border-none p-0 h-auto gap-6">
                        {['About', 'Jobs', 'Members'].map(tab => (
                          <TabsTrigger 
                            key={tab} value={tab.toLowerCase()}
                            className="p-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 bg-transparent font-bold text-xs tracking-wide transition-all text-slate-400"
                          >
                            {tab}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ANALYTICS SECTION */}
            {isOwnProfile && !isOrg && (
              <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                       <LayoutGrid size={16} className="text-slate-400" /> Analytics
                     </h2>
                     <p className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1"><Eye size={11} /> Private to you</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors shrink-0"><Users size={18} /></div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 leading-tight">{analytics?.profileViews || 0}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Profile views</p>
                        <p className="text-[11px] text-slate-400 mt-1">Discover who's viewing you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors shrink-0"><Search size={18} /></div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 leading-tight">{analytics?.searchAppearances || 0}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Search appearances</p>
                        <p className="text-[11px] text-slate-400 mt-1">See how often you show up</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DYNAMIC CONTENT */}
            {isOrg ? (
               <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                 <CardContent className="p-6 sm:p-8">
                   <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Building2 size={16} className="text-slate-400" /> Overview
                   </h2>
                   <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
                     {profile?.bio || 'Company bio not available.'}
                   </p>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100"><MapPin size={16} /></div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Headquarters</h4>
                          <p className="text-xs font-semibold text-slate-700 mt-1">{profile?.location || 'Global'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100"><Calendar size={16} /></div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Founded</h4>
                          <p className="text-xs font-semibold text-slate-700 mt-1">2010</p>
                        </div>
                      </div>
                   </div>

                   <div className="mt-8 border-t border-slate-100 pt-6">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                         {['AI', 'Cloud Computing', 'Enterprise SaaS', 'Deep Learning'].map(tag => (
                           <Badge key={tag} className="px-3.5 py-1.5 rounded-xl font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60 transition-colors">
                             {tag}
                           </Badge>
                         ))}
                      </div>
                   </div>
                 </CardContent>
               </Card>
            ) : (
              <div className="space-y-5">
                {/* About */}
                <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                       <h2 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                         <Info size={16} className="text-slate-400" /> About
                       </h2>
                       {isOwnProfile && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50" onClick={() => setEditProfileOpen(true)}><Pencil size={13} /></Button>}
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {profile?.bio || 'Add a bio to tell people about your background and goals.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 tracking-tight">
                        <Briefcase size={16} className="text-slate-400" /> Experience
                      </h2>
                      {isOwnProfile && (
                        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-slate-50" onClick={() => setExpDialog({ open: true })}>
                          <Plus size={18} className="text-slate-600" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-5">
                      {experiences.length === 0 ? <p className="text-xs font-medium text-slate-400 italic py-1">No experience added yet.</p> :
                        experiences.map((exp, idx) => (
                          <div key={exp.id || idx}>
                            <div className="flex gap-4 group items-start">
                              <div className="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 text-slate-500 shadow-sm">
                                <Building2 size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{exp.title}</h4>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{exp.company} • <span className="text-slate-400 font-medium">{exp.employmentType}</span></p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                      <Calendar size={12} /> {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                    </p>
                                  </div>
                                  {isOwnProfile && <Pencil size={13} className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-600 transition-all shrink-0 mt-1" onClick={() => setExpDialog({ open: true, item: exp })} />}
                                </div>
                                {exp.description && <p className="text-xs mt-2.5 text-slate-500 font-medium leading-relaxed max-w-2xl">{exp.description}</p>}
                              </div>
                            </div>
                            {idx < experiences.length - 1 && <Separator className="mt-5 bg-slate-100/70" />}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 tracking-tight">
                        <GraduationCap size={16} className="text-slate-400" /> Education
                      </h2>
                      {isOwnProfile && (
                        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-slate-50" onClick={() => setEduDialog({ open: true })}>
                          <Plus size={18} className="text-slate-600" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-5">
                      {educations.length === 0 ? <p className="text-xs font-medium text-slate-400 italic py-1">No education added yet.</p> :
                        educations.map((edu, idx) => (
                          <div key={edu.id || idx}>
                            <div className="flex gap-4 group items-start">
                              <div className="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 text-slate-500 shadow-sm">
                                <GraduationCap size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{edu.school || 'University'}</h4>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{edu.degree} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : ''}</p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                      <Calendar size={12} /> {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                                    </p>
                                  </div>
                                  {isOwnProfile && <Pencil size={13} className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-600 transition-all shrink-0 mt-1" onClick={() => setEduDialog({ open: true, item: edu })} />}
                                </div>
                              </div>
                            </div>
                            {idx < educations.length - 1 && <Separator className="mt-5 bg-slate-100/70" />}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 tracking-tight">
                          <Star size={16} className="text-slate-400" /> Skills
                        </h2>
                        {isOwnProfile && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50" onClick={() => setSkillOpen(true)}><Plus size={16} /></Button>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.length === 0 ? <p className="text-xs text-slate-400 italic">Not added</p> :
                          skills.map((sk, i) => (
                            <Badge key={i} className="px-3 py-1 bg-slate-50 text-indigo-600 border border-slate-100 hover:bg-indigo-50/50 transition-colors cursor-default font-semibold text-xs rounded-lg shadow-sm">
                              {sk.skillName || sk.name}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 tracking-tight">
                          <Globe2 size={16} className="text-slate-400" /> Languages
                        </h2>
                        {isOwnProfile && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50" onClick={() => setLangDialog({ open: true })}><Plus size={16} /></Button>}
                      </div>
                      <div className="space-y-3">
                        {languages.length === 0 ? <p className="text-xs text-slate-400 italic">Not added</p> :
                          languages.map((lang, i) => (
                            <div key={i} className="flex justify-between items-center group p-1 hover:bg-slate-50 rounded-lg transition-colors">
                               <div>
                                  <p className="text-xs font-semibold text-slate-800">{lang.language}</p>
                                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{lang.proficiency}</p>
                               </div>
                               {isOwnProfile && <Pencil size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-600 transition-all" onClick={() => setLangDialog({ open: true, item: lang })} />}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* ПРАВЫЙ САЙДБАР */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-transparent">
                  <h3 className="text-xs font-bold text-slate-400 tracking-tight">{isOrg ? 'Similar Companies' : 'People also viewed'}</h3>
                  <MoreHorizontal size={14} className="text-slate-400" />
               </div>
               <CardContent className="p-4 space-y-4">
                  {isOrg ? (
                    [
                      { name: 'CloudSphere Dynamics', desc: 'Software • 5k employees' },
                      { name: 'NeuralSystems Inc.', desc: 'AI • 2k employees' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 group cursor-pointer items-start border-b border-slate-50 last:border-0 last:pb-0 pb-3">
                         <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"><Building2 size={15} /></div>
                         <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{item.name}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{item.desc}</p>
                            <Button variant="link" className="h-auto p-0 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors mt-1">+ Follow</Button>
                         </div>
                      </div>
                    ))
                  ) : (
                    [
                      { name: 'Lisa Wong', title: 'Principal ML Engineer' },
                      { name: 'David Kumar', title: 'ML Research Lead' },
                    ].map((person, i) => (
                      <div key={i} className="flex items-center gap-3 group cursor-pointer justify-between">
                         <div className="flex items-center gap-3 min-w-0">
                           <Avatar className="h-9 w-9 border border-slate-100 shadow-sm rounded-xl">
                             <AvatarFallback className="bg-slate-50 text-slate-600 text-xs font-semibold">{person.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 group-hover:underline transition-all truncate">{person.name}</p>
                              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{person.title}</p>
                           </div>
                         </div>
                         <Button variant="outline" size="sm" className="rounded-xl h-8 text-[11px] font-semibold px-3 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shrink-0">Connect</Button>
                      </div>
                    ))
                  )}
               </CardContent>
            </Card>

            {/* Подвал сайдбара */}
            <div className="text-center space-y-3 pt-4">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400">
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">About</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Careers</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Help Center</span>
              </div>
              <p className="text-[10px] font-medium text-slate-300 flex items-center justify-center gap-2 tracking-wide uppercase">
                <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight shadow-sm">AIJob</span> © 2026 Professional Network.
              </p>
            </div>

          </div>
        </div>

        {/* DIALOGS */}
        <EditProfileDialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
        <ExperienceDialog open={expDialog.open} item={expDialog.item} userId={Number(activeUserId)} onClose={() => setExpDialog({ open: false })} />
        <EducationDialog open={eduDialog.open} item={eduDialog.item} onClose={() => setEduDialog({ open: false })} />
        <SkillDialog open={skillOpen} onClose={() => setSkillOpen(false)} userId={String(activeUserId || '')} />
        <LanguageDialog open={langDialog.open} item={langDialog.item} onClose={() => setLangDialog({ open: false })} profileId={String(profile?.id || '')} />
      </div>
    </section>
  );
};

export default Profile;