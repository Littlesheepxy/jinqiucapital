"use client"

import { useAdmin } from "../context/AdminContext"
import { WechatCategoryFilter, WechatArticleCard, WechatArticleEditModal } from "./wechat"

export function WechatArticlesTab() {
  const { state, actions } = useAdmin()
  const { 
    wechatArticles, 
    wechatLoading, 
    wechatError, 
    wechatCategoryFilter,
    wechatSearchQuery,
    editingArticle,
    savingArticle,
    saveArticleSuccess,
  } = state
  const { 
    loadWechatArticles, 
    deleteWechatArticle, 
    toggleWechatArticleHidden,
    setEditingArticle,
    setWechatCategoryFilter,
    setWechatSearchQuery,
    saveWechatArticle,
  } = actions

  return (
    <>
      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
        {/* 标题栏 */}
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>微信文章管理</h2>
          <button
            onClick={() => loadWechatArticles()}
            disabled={wechatLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: wechatLoading ? "not-allowed" : "pointer",
              opacity: wechatLoading ? 0.6 : 1,
            }}
          >
            {wechatLoading ? "加载中..." : "刷新文章列表"}
          </button>
        </div>

        {/* 筛选和搜索 */}
        <WechatCategoryFilter
          categoryFilter={wechatCategoryFilter}
          searchQuery={wechatSearchQuery}
          articleCount={wechatArticles.length}
          loading={wechatLoading}
          onCategoryChange={(category) => {
            setWechatCategoryFilter(category)
            loadWechatArticles(category, wechatSearchQuery)
          }}
          onSearchChange={setWechatSearchQuery}
          onSearch={() => loadWechatArticles()}
          onReset={() => {
            setWechatCategoryFilter("all")
            setWechatSearchQuery("")
            loadWechatArticles("all", "")
          }}
        />

        {/* 错误提示 */}
        {wechatError && (
          <div style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            ❌ {wechatError}
          </div>
        )}

        {/* 加载状态 */}
        {wechatLoading && (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#666"
          }}>
            加载中...
          </div>
        )}

        {/* 文章列表 */}
        {!wechatLoading && wechatArticles.length > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {wechatArticles.map((article: any) => (
              <WechatArticleCard
                key={article.id}
                article={article}
                onEdit={() => setEditingArticle(article)}
                onDelete={() => deleteWechatArticle(article.id)}
                onToggleHidden={() => toggleWechatArticleHidden(article.id, article.hidden)}
              />
            ))}
          </div>
        )}

        {/* 无文章提示 */}
        {!wechatLoading && wechatArticles.length === 0 && !wechatError && (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#999"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p>暂无文章</p>
          </div>
        )}
      </div>

      {/* 文章编辑弹窗 */}
      {editingArticle && (
        <WechatArticleEditModal
          article={editingArticle}
          saving={savingArticle}
          saveSuccess={saveArticleSuccess}
          onClose={() => setEditingArticle(null)}
          onSave={() => saveWechatArticle(editingArticle)}
          onChange={setEditingArticle}
        />
      )}
    </>
  )
}
