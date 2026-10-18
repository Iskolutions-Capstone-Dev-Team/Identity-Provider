# Gemini Security Analysis F1 Evaluation Report
**Date:** 2026-10-18 16:42:08
**Model Evaluated:** `gemini-3.1-flash-lite`
**Total Evaluated Scenarios:** 210
**Overall Accuracy:** 97.14%

## Classification Report
| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **LOW** | 1.0000 | 0.9143 | 0.9552 | 70 |
| **MEDIUM** | 0.9211 | 1.0000 | 0.9589 | 70 |
| **HIGH** | 1.0000 | 1.0000 | 1.0000 | 70 |
| **Macro Avg** | 0.9737 | 0.9714 | **0.9714** | 210 |
| **Weighted Avg** | 0.9737 | 0.9714 | **0.9714** | 210 |

## Confusion Matrix
| Actual \ Predicted | Pred LOW | Pred MEDIUM | Pred HIGH |
| :--- | :---: | :---: | :---: |
| **Actual LOW** | 64 | 6 | 0 |
| **Actual MEDIUM** | 0 | 70 | 0 |
| **Actual HIGH** | 0 | 0 | 70 |
