# 旅游打卡攻略系统 (Travel Guide)

一个前后端分离的旅游打卡攻略系统，支持用户登录、选择城市景点、创建旅游攻略、生成PDF等功能。

## 技术栈

- **前端**: React + TypeScript + Ant Design
- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL 8.0
- **其他**: PDFKit (PDF生成), multer (文件上传), JWT (认证), bcryptjs (密码加密)

## 功能特性

1. **用户认证** - 注册/登录，JWT token认证
2. **城市浏览** - 查看所有城市，选择感兴趣的城市
3. **景点选择** - 查看城市下所有景点，勾选想去的景点
4. **拖拽排序** - 通过拖拽调整景点游览顺序
5. **照片上传** - 在每个景点节点上传照片和评价
6. **PDF生成** - 保存攻略后可生成PDF下载
7. **可见性设置** - 攻略可设为公开或私密
8. **攻略浏览** - 查看自己的攻略和所有公开攻略

## 项目结构

```
Travel-Guide/
├── client/          # React前端
│   ├── src/
│   │   ├── api/         # Axios实例和API配置
│   │   ├── components/  # 通用组件
│   │   ├── pages/       # 页面组件
│   │   ├── store/       # 状态管理 (Auth Context)
│   │   └── types/       # TypeScript类型定义
│   └── package.json
├── server/          # Express后端
│   ├── src/
│   │   ├── config/      # 数据库配置
│   │   ├── middleware/  # JWT认证中间件
│   │   └── routes/      # API路由
│   ├── uploads/         # 上传文件目录
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js >= 18
- MySQL 8.0

### 1. 配置数据库

```sql
CREATE DATABASE travel_guide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 启动后端

```bash
cd server
cp .env.example .env  # 编辑.env配置数据库连接信息
npm install
npm run dev
```

后端运行在 http://localhost:5000

### 3. 初始化数据库表和种子数据

首次运行后端时，需要先执行数据库建表和种子数据SQL（见 server/.env.example 中的说明）。

### 4. 启动前端

```bash
cd client
npm install
npm start
```

前端运行在 http://localhost:3000

## API接口

| 方法 | 路径 | 说明 | 需认证 |
|------|------|------|--------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/cities | 获取所有城市 | ❌ |
| GET | /api/attractions?city_id=X | 获取城市景点 | ❌ |
| POST | /api/guides | 创建攻略 | ✅ |
| GET | /api/guides/my | 获取我的攻略 | ✅ |
| GET | /api/guides/public | 获取公开攻略 | ❌ |
| GET | /api/guides/:id | 获取攻略详情 | ❌ |
| PUT | /api/guides/:id | 更新攻略 | ✅ |
| DELETE | /api/guides/:id | 删除攻略 | ✅ |
| POST | /api/upload | 上传照片 | ✅ |
| GET | /api/guides/:id/pdf | 下载攻略PDF | ❌ |