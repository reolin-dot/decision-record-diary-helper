# 决策成长日记 Web App

这是“决策成长日记”的 Web 应用源码目录。根目录负责项目资料和归档，本目录只保留可运行应用相关文件。

## 启动

```powershell
Set-Location 'E:\决策成长日记\web-app'
npm install
npm run dev
```

启动后打开终端显示的本地地址，通常是：

```text
http://localhost:3000/
```

## 常用命令

```powershell
npm run dev
npm run build
npm run preview
```

- `npm run dev`：本地开发预览。
- `npm run build`：生产构建检查。
- `npm run preview`：预览构建后的版本。

## 目录说明

```text
web-app/
  src/                         Web 应用源码
  index.html                   HTML 入口
  package.json                 项目脚本和依赖
  package-lock.json            依赖锁定文件
  vite.config.js               Vite 配置
```

不要提交：

- `node_modules/`
- `dist/`
- `.env`

## 相关资料

项目文档、题库、截图和旧版本参考已经整理到项目根目录：

- `../docs/`
- `../assets/`
- `../archive/`
