// Admin 页面类型定义

export type AdminTab = "intro" | "team" | "portfolio" | "projects" | "research" | "wechat-articles" | "videos"

export type PreviewType = "intro" | "research-intro" | "research-article"

export type Language = "zh" | "en"

// 版本历史
export interface VersionHistoryItem {
  timestamp: number
  content: any
  team: TeamMember[]
  description: string
  version?: number
  id?: string
}

// 团队成员
export interface TeamMember {
  name: string | { zh: string; en: string }  // 支持旧格式（字符串）和新格式（对象）
  title: string       // 英文职位
  title_zh?: string   // 中文职位
  link: string
  hidden?: boolean
}

// 投资组合
export interface PortfolioFounder {
  name: { zh: string; en: string }
  link: string
}

export interface PortfolioItem {
  name: { zh: string; en: string }
  link: string
  founders?: PortfolioFounder[]
  hidden?: boolean
}

export interface PortfolioData {
  desc: { zh: string; en: string }
  items: PortfolioItem[]
}

// 项目
export interface ProjectItem {
  name: { zh: string; en: string }
  desc: { zh: string; en: string }
  link: string
}

export interface ProjectsData {
  list: ProjectItem[]
}

// 研究文章
export interface ResearchArticle {
  title: { zh: string; en: string }
  slug: string
  content: { zh: string; en: string }
}

// 研究项目内容类型
export type ResearchContentType = "article" | "video"

export interface ResearchItem {
  name: { zh: string; en: string }
  desc: { zh: string; en: string }
  slug: string
  intro: { zh: string; en: string }
  type?: ResearchContentType  // 内容类型：article=图文(微信), video=视频(B站)
  articles: ResearchArticle[]
  hidden?: boolean
}

export interface ResearchData {
  list: ResearchItem[]
}

// 关于介绍
export interface AboutData {
  intro: { zh: string; en: string }
}

// 内容数据
export interface ContentData {
  about: AboutData
  portfolio: PortfolioData
  projects: ProjectsData
  research: ResearchData
}

// 微信文章
export interface WechatArticle {
  id: string
  title: string
  content: string
  summary?: string
  cover_image?: string
  author?: string
  category?: string
  pub_date?: string
  hidden?: boolean
  created_at?: string
  updated_at?: string
}

// 视频
export interface Video {
  id: string
  title: string
  description: string
  bvid: string
  category: string | null
  tags: string[]
  cover_image?: string | null
  sort_order: number
  hidden: boolean
  created_at: string
  updated_at: string
}

// Admin 状态
export interface AdminState {
  isAuthenticated: boolean
  password: string
  contentData: ContentData | null
  teamData: TeamMember[]
  activeTab: AdminTab
  saving: boolean
  message: string
  activeResearchIndex: number
  expandedArticles: Record<string, boolean>
  showPreview: boolean
  previewContent: string
  previewLanguage: Language
  previewType: PreviewType
  previewResearchIndex: number
  previewArticleIndex: number
  showWelcomeModal: boolean
  showConfetti: boolean
  autoSaving: boolean
  lastSaved: Date | null
  showVersionHistory: boolean
  versionHistory: VersionHistoryItem[]
  selectedVersion: number | null
  // 微信文章状态
  wechatArticles: WechatArticle[]
  wechatLoading: boolean
  wechatError: string | null
  editingArticle: WechatArticle | null
  wechatCategoryFilter: string
  wechatSearchQuery: string
  savingArticle: boolean
  saveArticleSuccess: boolean
  // 视频状态
  videos: Video[]
  videosLoading: boolean
  videosError: string | null
  editingVideo: Video | null
  videoCategoryFilter: string
  videoSearchQuery: string
  savingVideo: boolean
  saveVideoSuccess: boolean
}

// Admin Actions 接口
export interface AdminActions {
  // 数据操作
  loadData: () => Promise<void>
  handleSave: () => void
  markAsChanged: () => void
  
  // 团队操作
  addTeamMember: () => void
  removeTeamMember: (index: number) => void
  updateTeamMember: (index: number, field: string, value: string) => void
  
  // 投资组合操作
  addPortfolioItem: () => void
  removePortfolioItem: (index: number) => void
  updatePortfolioItem: (index: number, lang: string, field: string, value: string) => void
  addPortfolioFounder: (itemIndex: number) => void
  removePortfolioFounder: (itemIndex: number, founderIndex: number) => void
  updatePortfolioFounder: (itemIndex: number, founderIndex: number, lang: string, field: string, value: string) => void
  
  // 项目操作
  addProject: () => void
  removeProject: (index: number) => void
  updateProject: (index: number, lang: string, field: string, value: string) => void
  
  // 研究操作
  addResearch: () => void
  removeResearch: (index: number) => void
  updateResearch: (index: number, lang: string, field: string, value: string) => void
  addArticle: (researchIndex: number) => void
  removeArticle: (researchIndex: number, articleIndex: number) => void
  updateArticle: (researchIndex: number, articleIndex: number, lang: string, field: string, value: string) => void
  toggleArticleExpand: (researchIndex: number, articleIndex: number) => void
  isArticleExpanded: (researchIndex: number, articleIndex: number) => boolean
  handleResearchDragEnd: (event: any) => void
  toggleResearchHidden: (index: number) => void
  
  // 版本历史
  restoreVersion: (timestamp: number) => void
  deleteVersion: (timestamp: number) => void
  clearAllVersions: () => void
  
  // 微信文章操作
  loadWechatArticles: (overrideCategory?: string, overrideSearch?: string) => Promise<void>
  saveWechatArticle: (articleData: any) => Promise<void>
  deleteWechatArticle: (id: string) => Promise<void>
  toggleWechatArticleHidden: (id: string, currentHidden: boolean) => Promise<void>
  
  // 预览操作
  updatePreview: (content: string, type: PreviewType, researchIdx?: number, articleIdx?: number) => void
  openPreviewInNewTab: () => void
  
  // 状态更新
  setContentData: (data: ContentData) => void
  setTeamData: (data: TeamMember[]) => void
  setActiveTab: (tab: AdminTab) => void
  setMessage: (msg: string) => void
  setActiveResearchIndex: (index: number) => void
  setShowPreview: (show: boolean) => void
  setPreviewLanguage: (lang: Language) => void
  setShowWelcomeModal: (show: boolean) => void
  setShowVersionHistory: (show: boolean) => void
  setEditingArticle: (article: WechatArticle | null) => void
  setWechatCategoryFilter: (filter: string) => void
  setWechatSearchQuery: (query: string) => void
  
  // 视频操作
  loadVideos: (overrideCategory?: string, overrideSearch?: string) => Promise<void>
  addVideo: (videoData: Partial<Video>) => Promise<void>
  updateVideo: (videoData: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  toggleVideoHidden: (id: string, currentHidden: boolean) => Promise<void>
  setEditingVideo: (video: Video | null) => void
  setVideoCategoryFilter: (filter: string) => void
  setVideoSearchQuery: (query: string) => void
}
