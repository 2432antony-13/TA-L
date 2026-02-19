from PIL import Image
import sys
import os

def remove_white_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Hardcoded paths for the user's environment
    input_file = r"d:\FINAL AND FINAL\研三\院运会\TA L\TA L\src\assets\mascot.png"
    output_file = r"d:\FINAL AND FINAL\研三\院运会\TA L\TA L\src\assets\mascot.png" 
    remove_white_background(input_file, output_file)
