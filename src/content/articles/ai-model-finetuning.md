# AI 模型微调入门指南

> **分类**: AI & 机器学习 | **阅读时间**: 12 分钟 | **发布时间**: 2025-12-18

## 目录

- [微调概述](#微调概述)
- [准备工作](#准备工作)
- [数据处理](#数据处理)
- [模型训练](#模型训练)
- [评估与优化](#评估与优化)
- [部署应用](#部署应用)

---

## 微调概述

微调（Fine-tuning）是在预训练模型基础上，使用特定领域的数据进行进一步训练，使模型更好地适应特定任务。

### 为什么需要微调？

- 预训练模型虽然通用，但可能不够专业
- 特定领域的术语和知识需要学习
- 可以用更少的数据达到更好的效果

---

## 准备工作

### 1. 环境配置

```bash
# 安装必要的库
pip install transformers datasets torch accelerate

# 安装 PEFT（参数高效微调）
pip install peft
```

### 2. 选择模型

常用的开源模型：
- BERT 系列：文本分类、命名实体识别
- GPT 系列：文本生成
- LLaMA：大语言模型
- BLOOM：多语言模型

### 3. 准备计算资源

- GPU 至少 8GB 显存
- 推荐使用 Google Colab 或云服务器
- 本地训练需要较好的硬件配置

---

## 数据处理

### 1. 数据格式

```json
{
  "train": [
    {
      "text": "你的训练文本",
      "label": "类别标签"
    }
  ],
  "validation": [
    {
      "text": "验证文本",
      "label": "类别标签"
    }
  ]
}
```

### 2. 数据预处理

```python
from transformers import AutoTokenizer
from datasets import Dataset

# 加载分词器
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')

# 定义预处理函数
def preprocess_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding=True,
        max_length=512
    )

# 应用预处理
tokenized_datasets = datasets.map(preprocess_function, batched=True)
```

### 3. 数据增强

```python
# 简单的数据增强方法
def augment_text(text):
    # 同义词替换
    # 随机删除
    # 随机交换
    return augmented_text
```

---

## 模型训练

### 1. 基础微调

```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

# 加载模型
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=3
)

# 配置训练参数
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=10,
)

# 创建训练器
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
)

# 开始训练
trainer.train()
```

### 2. 参数高效微调（PEFT）

```python
from peft import LoraConfig, get_peft_model

# 配置 LoRA
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="SEQ_CLS"
)

# 应用 PEFT
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
```

### 3. 分布式训练

```python
from accelerate import Accelerator

accelerator = Accelerator()
model, optimizer, train_dataloader = accelerator.prepare(
    model, optimizer, train_dataloader
)
```

---

## 评估与优化

### 1. 评估指标

```python
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    preds = np.argmax(predictions, axis=1)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='weighted'
    )
    acc = accuracy_score(labels, preds)

    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }
```

### 2. 超参数优化

```python
from transformers import TrainerCallback

class HyperparameterCallback(TrainerCallback):
    def on_log(self, args, state, control, logs=None, **kwargs):
        # 记录训练过程中的指标
        pass
```

### 3. 保存模型

```python
# 保存训练好的模型
model.save_pretrained('./my_model')
tokenizer.save_pretrained('./my_model')

# 保存为 PEFT 格式
model.save_pretrained('./my_peft_model')
```

---

## 部署应用

### 1. 使用 FastAPI 部署

```python
from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

# 加载模型
classifier = pipeline('text-classification', model='./my_model')

@app.post('/predict')
def predict(text: str):
    result = classifier(text)
    return result
```

### 2. 使用 Hugging Face Spaces

```python
# 部署到 Hugging Face
# 1. 创建 Space
# 2. 上传模型文件
# 3. 配置 app.py
# 4. 自动部署
```

---

## 常见问题

### Q: 训练时显存不足怎么办？

A:
- 使用更小的 batch size
- 使用梯度累积
- 使用 PEFT 方法
- 使用更小的模型

### Q: 如何选择学习率？

A: 一般从 1e-5 到 5e-5 之间尝试，使用学习率调度器。

### Q: 训练需要多长时间？

A: 取决于数据集大小、模型大小和硬件配置，一般几小时到几天不等。

---

## 总结

微调是一个实用的技术，可以用较少的资源和时间获得专门化的模型。关键是做好数据准备、选择合适的模型和训练策略。

**相关资源**:
- [Hugging Face 官方文档](https://huggingface.co/docs)
- [Transformers 库 GitHub](https://github.com/huggingface/transformers)
