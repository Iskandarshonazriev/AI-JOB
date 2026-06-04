import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock, DollarSign,
  GraduationCap,
  Loader2,
  Search,
  Share2,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyToJob,
  fetchJobs,
  toggleSaveJob
} from '../../../api/jobApi';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { useToast } from '../../../components/ui/use-toast';
import type { AppDispatch, RootState } from '../../../store';
import { setSelectedJob } from '../../../store/slices/jobSlice';

import jobIcon from '../../../assets/hero.png'

const JobSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, selectedJob, loading } = useSelector((s: RootState) => s.jobs);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleApply = async (id: string | number) => {
    try {
      await dispatch(applyToJob(id)).unwrap();
      toast({ title: 'Application Sent!', description: 'Your profile has been shared with the recruiter.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to apply. Please try again.' });
    }
  };

  const handleSave = (id: string | number) => {
    dispatch(toggleSaveJob(id));
    const job = jobs.find(j => j.id === id);
    toast({ title: !job?.isSaved ? 'Job Saved' : 'Job Unsaved' });
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50/50 min-h-screen antialiased text-slate-900">
      <div className="max-w-[1400px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Pane: Job List */}
        <div className="w-[400px] flex flex-col border-r border-slate-100 bg-white shrink-0">
          <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Search jobs by title or company"
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 bg-slate-50/30">
            <div className="p-3 space-y-2.5">
              {loading && jobs.length === 0 ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-medium text-sm bg-white/50 rounded-2xl border border-dashed border-slate-200 m-1">
                  No jobs found
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div 
                    key={job.id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden group ${
                      selectedJob?.id === job.id 
                      ? 'bg-indigo-600/5 border-indigo-600 shadow-sm shadow-indigo-600/5' 
                      : 'bg-white hover:bg-slate-50/80 border-slate-100 hover:border-slate-200 shadow-sm shadow-slate-100/50'
                    }`}
                    onClick={() => dispatch(setSelectedJob(job))}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="h-11 w-11 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-1.5 shadow-sm bg-white group-hover:scale-105 transition-transform">
                        <img src={jobIcon} alt="Job" className="w-full h-full object-contain" />
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100/80 font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-lg shadow-sm">
                        {job.aiMatchScore || 50}% Match
                      </Badge>
                    </div>
                    
                    <h3 className={`font-semibold text-sm line-clamp-1 mb-1 tracking-tight ${selectedJob?.id === job.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">{job.companyName} <span className="text-slate-300 mx-1">•</span> {job.location}</p>
                    
                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 border-t border-slate-50 pt-3">
                      <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> {job.postedAt || 'Posted 2h ago'}</span>
                      <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">{job.salary || 'Not specified'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Pane: Job Details */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {selectedJob ? (
            <ScrollArea className="flex-1">
              <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full">
                <Card className="border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-0">
                    
                    {/* Header Section */}
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start gap-6 bg-gradient-to-b from-slate-50/60 to-transparent border-b border-slate-100">
                      <div className="flex gap-5 items-center">
                        <div className="h-16 w-16 bg-white rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center shadow-md p-2">
                          <img src={jobIcon} alt="Job" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-1">
                          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{selectedJob.title}</h1>
                          <p className="text-slate-500 font-medium flex items-center gap-1.5 text-sm sm:text-base">
                            <span className="text-slate-800 font-semibold">{selectedJob.companyName}</span>
                            <span className="text-slate-300">•</span> 
                            <span>{selectedJob.location}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <Button 
                          className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-11 rounded-xl shadow-md shadow-slate-900/10 transition-all active:scale-[0.98]"
                          onClick={() => handleApply(selectedJob.id)}
                        >
                          Apply Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={`h-11 w-11 rounded-xl border-slate-200 transition-all active:scale-[0.98] ${selectedJob.isSaved ? 'bg-amber-50/60 border-amber-200 text-amber-600 shadow-sm shadow-amber-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                          onClick={() => handleSave(selectedJob.id)}
                        >
                          <Bookmark size={18} className={selectedJob.isSaved ? 'fill-current' : ''} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"><Share2 size={17} /></Button>
                      </div>
                    </div>

                    {/* Quick Info Bento Grid */}
                    <div className="px-6 sm:p-8 pt-6 pb-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/70">
                        <div className="space-y-1 p-2 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase size={12} className="text-slate-400" /> Experience
                          </p>
                          <p className="font-semibold text-sm text-slate-800">{selectedJob.experienceLevel || '5+ Years'}</p>
                        </div>
                        <div className="space-y-1 p-2 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap size={12} className="text-slate-400" /> Education
                          </p>
                          <p className="font-semibold text-sm text-slate-800 truncate">{selectedJob.educationLevel || 'PhD / Masters'}</p>
                        </div>
                        <div className="space-y-1 p-2 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign size={12} className="text-slate-400" /> Salary
                          </p>
                          <p className="font-semibold text-sm text-slate-800">{selectedJob.salary || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1 p-2 bg-emerald-50/40 border border-emerald-100/50 rounded-xl shadow-sm">
                          <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={12} className="text-emerald-500" /> AI Match
                          </p>
                          <p className="font-bold text-sm text-emerald-700">{selectedJob.aiMatchScore || 50}% Match</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Details Body */}
                    <div className="p-6 sm:p-8 pt-4 flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-8">
                        <section className="space-y-3">
                          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Description</h2>
                          <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-normal">
                            {selectedJob.description.split('\n').map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                        </section>

                        <section className="space-y-3">
                          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Required Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {(selectedJob.skills || ['PyTorch', 'Transformers', 'Distributed Training', 'CUDA', 'NLP', 'Deep Learning', 'LLMs']).map(skill => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className="px-3.5 py-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-slate-600 font-medium text-xs hover:border-indigo-600 hover:text-indigo-600 transition-colors cursor-default"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </section>
                      </div>

                      {/* Right Sidebar Inside Card */}
                      <div className="w-full lg:w-[280px] space-y-5 shrink-0">
                        
                        {/* Why You Match Card */}
                        <div className="p-5 bg-gradient-to-b from-indigo-50/70 to-indigo-50/30 rounded-2xl border border-indigo-100/80 shadow-sm relative overflow-hidden group">
                          <div className="absolute -right-6 -top-6 bg-indigo-500/10 h-20 w-20 rounded-full group-hover:scale-150 transition-transform duration-700" />
                          <div className="relative z-10 space-y-4">
                             <div className="flex items-center gap-2">
                               <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/10"><Sparkles size={14} /></div>
                               <h3 className="font-bold text-indigo-900 tracking-tight text-xs">Why You Match</h3>
                             </div>
                             <div className="space-y-3">
                                {[
                                  'Your AI experience matches requirements.',
                                  'Previous ML research experience.',
                                  'Salary expectations fit range.',
                                  'Leadership opportunity available.'
                                ].map((reason, i) => (
                                  <div key={i} className="flex gap-2.5 items-start">
                                    <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-[12px] font-medium text-slate-600 leading-tight">{reason}</p>
                                  </div>
                                ))}
                             </div>
                             <Button className="w-full bg-white hover:bg-slate-50 border border-indigo-100 text-indigo-600 font-medium h-9 rounded-xl shadow-sm text-xs mt-1 transition-all">
                               View Full Fit Report
                             </Button>
                          </div>
                        </div>

                        {/* Recruiter Box */}
                        <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm border border-slate-200/60 space-y-4">
                           <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Recruiter Info</h3>
                           <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
                                <AvatarImage src={selectedJob.recruiter?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-xs">SC</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-slate-900 text-sm leading-tight truncate">{selectedJob.recruiter?.fullName || 'Sarah Chen'}</h4>
                                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{selectedJob.recruiter?.title || 'Head of Talent'}</p>
                              </div>
                           </div>
                           <Button variant="ghost" className="w-full rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 gap-2 h-9 transition-all">
                             <MessageSquare size={13} /> Contact Recruiter
                           </Button>
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white m-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-100/50">
              <div className="bg-slate-50 p-6 rounded-2xl mb-5 text-slate-300">
                <Briefcase size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Select a job to view details</h2>
              <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
                Click on one of the positions in the list to your left to explore the full description, requirements, and AI match analysis.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Internal MessageSquare icon
const MessageSquare = ({ size }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default JobSearch;