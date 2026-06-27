# TextEditor 组件

## 简介

`TextEditor` 是一个通用的文本编辑器组件，支持 Markdown 和 TXT 两种格式。

## 功能特性

- **双格式支持**：Markdown 和 TXT 两种格式可自由切换
- **Markdown 工具栏**：提供常用的 Markdown 语法快捷按钮
- **实时预览**：Markdown 格式支持实时预览渲染效果
- **字数统计**：实时显示内容字数
- **深色模式**：完全支持深色模式
- **响应式设计**：适配各种屏幕尺寸

## 使用方法

### 基本用法

```vue
<template>
  <TextEditor
    v-model="content"
    label="文章内容"
    :rows="20"
    :default-format="'markdown'"
    @format-change="handleFormatChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextEditor from '@/components/TextEditor.vue'

const content = ref('')

const handleFormatChange = (format: 'markdown' | 'txt') => {
  console.log('格式切换为:', format)
}
</script>
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | - | 编辑器内容（v-model 绑定） |
| `label` | `string` | - | 编辑器标签文字 |
| `rows` | `number` | `15` | 文本域行数 |
| `defaultFormat` | `'markdown' \| 'txt'` | `'markdown'` | 默认格式 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `value: string` | 内容变化时触发 |
| `format-change` | `format: 'markdown' \| 'txt'` | 格式切换时触发 |

## Markdown 语法支持

编辑器支持以下 Markdown 语法：

- **加粗**：`**文本**`
- *斜体*：`*文本*`
- 标题：`## 标题`
- 链接：`[文字](url)`
- 代码：`` `代码` ``
- 代码块：```` ```\n代码\n``` ````
- 引用：`> 引用`
- 列表：`- 列表项`
- 图片：`![图片](url)`
- 分割线：`---`

## 工具栏按钮

工具栏提供以下快捷按钮：

1. **加粗** - 插入粗体语法
2. *斜体* - 插入斜体语法
3. H2 - 插入二级标题
4. 🔗 - 插入链接
5. </> - 插入行内代码
6. </>块 - 插入代码块
7. > - 插入引用
8. • - 插入列表项
9. 🖼️ - 插入图片
10. --- - 插入分割线
11. 预览/隐藏预览 - 切换预览显示

## 使用场景

### 1. 笔记/文章编辑器

```vue
<TextEditor
  v-model="articleContent"
  label="文章内容"
  :rows="20"
  :default-format="'markdown'"
/>
```

### 2. 简单文本编辑

```vue
<TextEditor
  v-model="simpleText"
  label="备注信息"
  :rows="5"
  :default-format="'txt'"
/>
```

### 3. 伴侣描述编辑

```vue
<TextEditor
  v-model="companion.description"
  label="伴侣描述"
  :rows="4"
  :default-format="'markdown'"
/>
```

## 样式自定义

组件使用了 Tailwind CSS，可以通过以下方式自定义样式：

### 修改主题色

在 `TextEditor.vue` 中修改 `focus:ring-pink-500` 为你想要的颜色。

### 修改预览样式

在 `<style scoped>` 部分的 `.markdown-preview` 相关样式中自定义渲染效果。

## 注意事项

1. **格式切换**：切换格式时，内容会保留，但 Markdown 语法在 TXT 格式下不会被渲染
2. **预览功能**：预览只在 Markdown 格式下可用
3. **深色模式**：组件会自动适配系统深色模式
4. **性能优化**：对于超长文本（>10万字），建议考虑使用专门的 Markdown 编辑器库

## 示例项目

以下项目中已集成此组件：

- `UnifiedEditor.vue` - 统一的笔记/文章编辑器
- `CompanionEditorView.vue` - 伴侣编辑页面
- `EditorView.vue` - 文章编辑页面

## 许可证

MIT
