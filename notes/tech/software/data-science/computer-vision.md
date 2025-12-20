| Concept                     | Purpose                                                | Why It Matters                                              |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| **Infinite Straight Lines** | Perfect, infinite geometric lines from Hough transform | Great for detecting the true edge even when noisy or broken |
| **Clustering**              | Group many noisy/duplicate lines into 4 clean lines    | Needed to get top, bottom, left, right edges                |
| **Contours**                | Pixel-accurate shape outlines from edges               | Good for shapes; bad for long straight lines with noise     |
| **Hough Transform**         | Detects straight lines by voting in parameter space    | Robust to missing edges, broken lines, and noisy images     |
| **YOLO (Object Detection)** | Learns card bounding boxes from training data          | Extremely fast + accurate; ideal starting crop for pipeline |
