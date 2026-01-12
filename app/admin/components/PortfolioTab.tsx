"use client"

import { useAdmin } from "../context/AdminContext"

export function PortfolioTab() {
  const { state, actions } = useAdmin()
  const { contentData } = state
  const { 
    setContentData, 
    markAsChanged,
    addPortfolioItem, 
    removePortfolioItem, 
    updatePortfolioItem,
    addPortfolioFounder,
    removePortfolioFounder,
    updatePortfolioFounder
  } = actions

  if (!contentData) return null

  return (
    <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>描述文本</h3>
        <input
          type="text"
          placeholder="中文描述"
          value={contentData.portfolio.desc.zh}
          onChange={(e) => {
            const updated = { ...contentData }
            updated.portfolio.desc.zh = e.target.value
            setContentData(updated)
            markAsChanged()
          }}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "8px"
          }}
        />
        <input
          type="text"
          placeholder="英文描述"
          value={contentData.portfolio.desc.en}
          onChange={(e) => {
            const updated = { ...contentData }
            updated.portfolio.desc.en = e.target.value
            setContentData(updated)
            markAsChanged()
          }}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>投资项目列表</h3>
        <button
          onClick={addPortfolioItem}
          style={{
            padding: "8px 16px",
            backgroundColor: "#225BBA",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          + 添加项目
        </button>
      </div>
      {contentData.portfolio.items.map((item: any, index: number) => (
        <div key={index} style={{
          border: "2px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "#fafafa"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
            <button
              onClick={() => removePortfolioItem(index)}
              style={{
                padding: "4px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              删除项目
            </button>
          </div>
          
          {/* 项目基本信息 */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "16px", 
            borderRadius: "6px", 
            marginBottom: "16px",
            border: "1px solid #e0e0e0"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
              📌 项目信息
            </h4>
            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text"
                placeholder="项目名称（中文）"
                value={item.name.zh}
                onChange={(e) => updatePortfolioItem(index, "zh", "name", e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              <input
                type="text"
                placeholder="项目名称（英文）"
                value={item.name.en}
                onChange={(e) => updatePortfolioItem(index, "en", "name", e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              <input
                type="text"
                placeholder="项目官网链接（选填）"
                value={item.link || ""}
                onChange={(e) => updatePortfolioItem(index, "", "link", e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>

          {/* 创始人列表 */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "16px", 
            borderRadius: "6px",
            border: "1px solid #e0e0e0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                👤 创始人信息
              </h4>
              <button
                onClick={() => addPortfolioFounder(index)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                + 添加创始人
              </button>
            </div>
            
            {item.founders && item.founders.length > 0 ? (
              item.founders.map((founder: any, founderIndex: number) => (
                <div key={founderIndex} style={{
                  backgroundColor: "#f9f9f9",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  border: "1px solid #e8e8e8"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>创始人 #{founderIndex + 1}</span>
                    <button
                      onClick={() => removePortfolioFounder(index, founderIndex)}
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      删除
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="创始人姓名（中文）"
                      value={founder.name.zh}
                      onChange={(e) => updatePortfolioFounder(index, founderIndex, "zh", "name", e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "13px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="创始人姓名（英文）"
                      value={founder.name.en}
                      onChange={(e) => updatePortfolioFounder(index, founderIndex, "en", "name", e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "13px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="创始人个人链接（选填，如LinkedIn、Twitter等）"
                      value={founder.link || ""}
                      onChange={(e) => updatePortfolioFounder(index, founderIndex, "", "link", e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "13px"
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>
                暂无创始人信息，点击上方按钮添加
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
