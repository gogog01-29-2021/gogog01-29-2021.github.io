---
layout: page
title: CV-LPR — license-plate detection + recognition pipeline
description: A two-stage computer-vision pipeline — YOLO-based plate detection feeding an LPRNet-based character-sequence recognizer — wired through a Kafka producer/consumer for streaming results.
category: computer-vision
importance: 2
---

A two-stage license-plate recognition pipeline, built and trained end-to-end, not just scaffolding.

- **Two-stage detection + recognition.** A YOLO model localizes the plate (bounding box), then an LPRNet-based model reads the character sequence off the cropped plate — detection and recognition are separate trained models (`lp_detection.pt`, `lpr_recognition.pt`), not one end-to-end network.
- **Streaming pipeline, not a notebook.** Results flow through a Kafka producer/consumer setup (`result_consumer.py`, `result_cropped_consumer.py`) rather than a one-off batch script — built to process a stream of detections, not a fixed test set.
- **Open design questions tracked in the repo itself** — e.g. whether the character-recognition stage should output direct characters vs. coordinates, and whether plates need de-rotation before character recognition — left visible rather than papered over.

Code is private.
