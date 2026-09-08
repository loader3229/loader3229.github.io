# 读入charts.csv，charts.csv每一行都对应我的一个BanG Dream! 自制谱
# 按照1.json的格式把所有的自制谱读入后都变为json文件

import csv
import json
import os

import requests

def get_chart(bestdori_id: int):
  response = requests.get("https://bestdori.com/api/post/details?id="+str(bestdori_id))
  response.raise_for_status()
  return response.json()["post"]

def main():
  out_dir = os.path.dirname(os.path.abspath(__file__))
  with open(os.path.join(out_dir, "charts.csv"), encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
  for row in rows:
    post = get_chart(int(row["bestdori_id"]))
    chart = json.loads(json.dumps(post["chart"]))
    data = {
      "id": int(row["id"]),
      "bestdori_id": int(row["bestdori_id"]),
      "name": post["title"],
      "artist": post["artists"],
      "difficultyType": int(row["difficultyType"]),
      "difficultyLevel": post["level"],
      "difficultyCustomName": row["difficultyCustomName"],
      "chart": chart,
    }
    path = os.path.join(out_dir, row["id"] + ".json")
    with open(path, "w", encoding="utf-8") as f:
      json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("saved", path)

if __name__ == "__main__":
  main()
