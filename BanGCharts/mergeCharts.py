# 把目录下所有自制谱的json文件合并为一个BanGCharts.json（不含chart字段，不删除原文件）

import csv
import json
import os

def main():
  base_dir = os.path.dirname(os.path.abspath(__file__))
  with open(os.path.join(base_dir, "charts.csv"), encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
  merged = []
  for row in sorted(rows, key=lambda r: int(r["id"])):
    path = os.path.join(base_dir, row["id"] + ".json")
    with open(path, encoding="utf-8") as f:
      data = json.load(f)
    data.pop("chart", None)
    merged.append(data)
  out_path = os.path.join(base_dir, "BanGCharts.json")
  with open(out_path, "w", encoding="utf-8") as f:
    json.dump(merged, f, ensure_ascii=False, separators=(",", ":"))
  print("saved", out_path, "with", len(merged), "charts")

if __name__ == "__main__":
  main()
