import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { useFormik } from 'formik';
import {
  FileText,
  Image as ImageIcon,
  Info,
  UserPlus,
  Video,
  X,
  TrendingUp,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { createPost, fetchFeed, uploadImage } from '../../../api/postApi';
import PostCard from '../../../components/shared/PostCard';
import type { AppDispatch, RootState } from '../../../store';
import { getToken } from '../../../utils/token';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: posts } = useSelector((state: RootState) => state.posts);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const user = useMemo(() => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('token payload:', payload);
      return {
        id: payload.sub,
        name: payload.fullName || payload.name || "User",
        email: payload.email,
        initial: (payload.fullName || payload.name || payload.email || "U").charAt(0).toUpperCase()
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { content: '' },
    validationSchema: Yup.object({
      content: Yup.string().trim().required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      let imageUrl = null;
      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (e) {
          console.error('Image upload failed:', e);
        }
        setUploading(false);
      }
      await dispatch(createPost({ content: values.content, imageUrl }));
      resetForm();
      setImageFile(null);
      setImagePreview(null);
    },
  });

  return (
    <section className='bg-slate-50/50 min-h-screen antialiased text-slate-900'>
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">

          {/* Левый сайдбар: Профиль */}
          <div className="lg:col-span-3 lg:sticky lg:top-20">
            <Card className="overflow-hidden border border-slate-200/60 shadow-sm bg-white rounded-2xl">
              <div className="h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-85" />
              <div className="px-5 pb-5 -mt-10 flex flex-col items-center relative z-10">
                <div className="p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Avatar className="h-16 w-16 rounded-xl border-2 border-white">
                    <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-600 rounded-xl">
                      {user?.initial}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="mt-3 text-base font-bold text-slate-900 tracking-tight text-center">{user?.name}</h2>
                <p className="text-xs font-medium text-slate-400 text-center leading-normal mt-1 max-w-[200px]">
                  Senior Full-Stack Developer | AI & Cloud Architecture
                </p>
              </div>
              
              <Separator className="bg-slate-100" />
              
              <div className="p-4 space-y-2.5 text-xs font-medium">
                <div className="flex justify-between items-center hover:bg-slate-50 p-1.5 px-2 rounded-xl cursor-pointer transition-colors group">
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">Profile views</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px]">1,248</span>
                </div>
                <div className="flex justify-between items-center hover:bg-slate-50 p-1.5 px-2 rounded-xl cursor-pointer transition-colors group">
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">Post impressions</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px]">5,320</span>
                </div>
              </div>
              
              <Separator className="bg-slate-100" />
              
              <div className="p-3.5 mx-1.5 mb-1.5 text-xs font-semibold hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-all">
                <Bookmark size={14} className="text-slate-400" />
                <span>My items</span>
              </div>
            </Card>
          </div>

          {/* Центральная часть: Лента */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4 sm:p-5">
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="h-11 w-11 rounded-xl shrink-0 border border-slate-100 shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">{user?.initial}</AvatarFallback>
                    </Avatar>
                    <Input
                      name="content"
                      placeholder="Start a post with AI assistance..."
                      className="rounded-xl bg-slate-50/70 border-transparent focus-visible:bg-white focus-visible:border-slate-200 focus-visible:ring-4 focus-visible:ring-indigo-50/50 h-11 text-sm flex-1 placeholder:text-slate-400 transition-all font-medium"
                      value={formik.values.content}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                      <img src={imagePreview} alt="preview" className="w-full max-h-72 object-cover" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white rounded-xl h-8 w-8 backdrop-blur-sm transition-all"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={imageInputRef}
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl gap-2 font-medium h-9 text-xs"
                        onClick={() => imageInputRef.current?.click()}>
                        <ImageIcon className="text-blue-500/90" size={16} /> Photo
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl gap-2 font-medium h-9 text-xs">
                        <Video className="text-emerald-500/90" size={16} /> Video
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl gap-2 font-medium h-9 text-xs">
                        <FileText className="text-amber-500/90" size={16} /> Article
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-5 h-9 text-xs transition-all active:scale-[0.98] shadow-sm"
                      disabled={formik.isSubmitting || uploading || !formik.values.content.trim()}
                    >
                      {uploading ? 'Uploading...' : formik.isSubmitting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Контейнер для постов */}
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  currentUserInitial={user?.initial}
                />
              ))}
            </div>
          </div>

          {/* Правый сайдбар: Виджеты */}
          <div className="lg:col-span-3 space-y-5 lg:sticky lg:top-20">
            {/* AI Job Matches */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between pb-3 bg-gradient-to-b from-slate-50/50 to-transparent border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles size={14} /></div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">AI Job Matches</h3>
                </div>
                <Info size={14} className="text-slate-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-4 space-y-4">
                {[
                  { title: 'Staff Cloud Architect', company: 'CloudScale Inc.', match: '98% Match' },
                  { title: 'ML Engineer Lead', company: 'DataFlow Systems', match: '92% Match' }
                ].map((job, idx) => (
                  <div key={idx} className="flex gap-3 items-start group cursor-pointer border-b border-slate-50 last:border-0 last:pb-0 pb-3">
                    <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] text-white font-bold shrink-0 shadow-sm">
                      CS
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{job.title}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{job.company}</p>
                      <span className="inline-flex text-[10px] text-emerald-700 font-bold mt-2 bg-emerald-50 px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100/50">
                        {job.match}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-slate-700 border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl h-9 text-xs font-semibold transition-all mt-1">
                  View all matches
                </Button>
              </CardContent>
            </Card>

            {/* People you may know */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">People you may know</h3>
              <div className="space-y-4">
                {[
                  { name: 'Alex Morgan', title: 'Product at Linear' },
                  { name: 'Lisa Wong', title: 'Principal Engineer' }
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex gap-3 items-center min-w-0">
                      <Avatar className="h-10 w-10 rounded-xl border border-slate-100 shadow-sm">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-medium text-xs">{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{person.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{person.title}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0">
                      <UserPlus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending in Tech */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Trending in Tech</h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { tag: '#Web3Sustainability', posts: '1,240 posts' },
                  { tag: '#AIAssistedCoding', posts: '8,520 posts' },
                  { tag: '#RemoteWorkEvolution', posts: '4,110 posts' }
                ].map((trend, idx) => (
                  <div key={idx} className="cursor-pointer group block">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {trend.tag}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{trend.posts}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Home;