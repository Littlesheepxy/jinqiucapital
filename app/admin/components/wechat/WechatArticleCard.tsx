"use client"

interface WechatArticleCardProps {
  article: any
  onEdit: () => void
  onDelete: () => void
  onToggleHidden: () => void
}

export function WechatArticleCard({
  article,
  onEdit,
  onDelete,
  onToggleHidden,
}: WechatArticleCardProps) {
  return (
    <div
      style={{
        border: article.hidden ? "1px dashed #ccc" : "1px solid #e0e0e0",
        borderRadius: "6px",
        padding: "16px",
        backgroundColor: article.hidden ? "#f9f9f9" : "#fafafa",
        transition: "all 0.2s",
        opacity: article.hidden ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 标题和封面图 */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            {article.cover_image && (
              <img
                src={article.cover_image}
                alt=""
                style={{
                  width: "120px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  flexShrink: 0,
                  filter: article.hidden ? "grayscale(100%)" : "none",
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <h4 style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: article.hidden ? "#999" : "#225BBA",
                  lineHeight: "1.4",
                  textDecoration: article.hidden ? "line-through" : "none",
                }}>
                  {article.hidden && "🙈 "}
                  {article.title}
                </h4>
              </div>
              <p style={{
                fontSize: "13px",
                color: "#666",
                marginBottom: "8px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.5"
              }}>
                {article.description || "暂无描述"}
              </p>
            </div>
          </div>

          {/* 元信息 */}
          <div style={{
            display: "flex",
            gap: "12px",
            fontSize: "12px",
            color: "#999",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <span>📅 {article.publish_date}</span>
            <span>📁 {article.category || "未分类"}</span>
            <span>📱 {article.mp_name || "未知来源"}</span>
            {article.hidden && (
              <span style={{ 
                backgroundColor: "#f8d7da", 
                color: "#721c24", 
                padding: "2px 8px", 
                borderRadius: "4px",
                fontSize: "11px"
              }}>
                已隐藏
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginLeft: "16px",
          flexShrink: 0
        }}>
          <button
            onClick={onToggleHidden}
            style={{
              padding: "6px 12px",
              backgroundColor: article.hidden ? "#d4edda" : "#f8d7da",
              color: article.hidden ? "#155724" : "#721c24",
              border: `1px solid ${article.hidden ? "#c3e6cb" : "#f5c6cb"}`,
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
            title={article.hidden ? "点击显示" : "点击隐藏"}
          >
            {article.hidden ? "👁️ 显示" : "🙈 隐藏"}
          </button>
          <button
            onClick={onEdit}
            style={{
              padding: "6px 12px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
            title="编辑文章"
          >
            ✏️ 编辑
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 12px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              textDecoration: "none",
              textAlign: "center"
            }}
            title="查看原文"
          >
            🔗 原文
          </a>
          <button
            onClick={onDelete}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
            title="删除文章"
          >
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
  )
}
