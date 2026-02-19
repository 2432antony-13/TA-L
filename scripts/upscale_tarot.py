"""
Tarot Card AI-like Enhancement Script
使用Lanczos高质量放大 + 色彩增强 + 智能锐化
"""
import os
import sys
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

# 配置
INPUT_DIR = r"d:\vibe coding\TA L\public\tarot"
OUTPUT_DIR = r"d:\vibe coding\TA L\public\tarot_hd"
SCALE_FACTOR = 4  # 4x放大
TARGET_SIZE = (1400, 2400)  # 目标分辨率

# 增强参数
SATURATION_BOOST = 1.35
CONTRAST_BOOST = 1.18
BRIGHTNESS_BOOST = 1.05
SHARPNESS_BOOST = 1.3

def enhance_image(img_path, output_path):
    """对单张图片进行增强处理"""
    try:
        # 打开图片
        img = Image.open(img_path)
        
        # 1. 高质量放大 (Lanczos)
        original_size = img.size
        new_size = (original_size[0] * SCALE_FACTOR, original_size[1] * SCALE_FACTOR)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # 2. 色彩增强
        # 饱和度
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(SATURATION_BOOST)
        
        # 对比度
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(CONTRAST_BOOST)
        
        # 亮度
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(BRIGHTNESS_BOOST)
        
        # 3. 锐化
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(SHARPNESS_BOOST)
        
        # 4. 轻微去噪 (使用中值滤波)
        # img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # 5. 边缘增强 (UnsharpMask)
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=3))
        
        # 保存为高质量JPEG
        img.save(output_path, "JPEG", quality=95, optimize=True)
        return True
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return False

def main():
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 获取所有塔罗牌图片
    image_files = [f for f in os.listdir(INPUT_DIR) if f.endswith('.jpg')]
    total = len(image_files)
    
    print(f"开始处理 {total} 张塔罗牌图片...")
    print(f"输入目录: {INPUT_DIR}")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"放大倍数: {SCALE_FACTOR}x")
    print("-" * 50)
    
    success_count = 0
    for i, filename in enumerate(image_files, 1):
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        if enhance_image(input_path, output_path):
            success_count += 1
            print(f"[{i}/{total}] ✓ {filename}")
        else:
            print(f"[{i}/{total}] ✗ {filename} - 处理失败")
    
    print("-" * 50)
    print(f"处理完成! 成功: {success_count}/{total}")
    print(f"高清图片已保存至: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
