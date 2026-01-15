"use client"

import Confetti from "react-confetti"
import { AdminProvider, useAdmin } from "./context/AdminContext"
import {
  LoginForm,
  AdminHeader,
  TabNavigation,
  IntroTab,
  TeamTab,
  PortfolioTab,
  ProjectsTab,
  ResearchTab,
  WechatArticlesTab,
  VideosTab,
  PreviewPanel,
  VersionHistoryModal,
  WelcomeModal,
} from "./components"

function AdminContent() {
  const { state } = useAdmin()
  const { isAuthenticated, contentData, activeTab, showPreview, showConfetti } = state

  // 登录界面
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // 加载中
  if (!contentData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 顶部栏 */}
      <AdminHeader />

      {/* 主内容区 */}
      <div style={{
        display: "flex",
        gap: "24px",
        padding: "24px",
        maxWidth: showPreview ? "100%" : "1400px",
        margin: "0 auto",
        transition: "all 0.3s"
      }}>
        {/* 左侧编辑区 */}
        <div style={{ 
          flex: showPreview ? "0 0 55%" : "1",
          transition: "all 0.3s"
        }}>
          {/* Tab 导航 */}
          <TabNavigation />

          {/* Tab 内容 */}
          {activeTab === "intro" && <IntroTab />}
          {activeTab === "team" && <TeamTab />}
          {activeTab === "portfolio" && <PortfolioTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "research" && <ResearchTab />}
          {activeTab === "wechat-articles" && <WechatArticlesTab />}
          {activeTab === "videos" && <VideosTab />}
         </div>

        {/* 右侧预览区 */}
        <PreviewPanel />
            </div>

      {/* 弹窗和效果 */}
      <VersionHistoryModal />
      <WelcomeModal />

      {/* 撒花效果 */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#225BBA', '#17a2b8', '#28a745', '#ffc107', '#dc3545', '#6f42c1']}
        />
      )}

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes modal-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modal-scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  )
}
