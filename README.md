# TailorFit AI — Production-Grade AI Human Body Measurement Platform

**TailorFit AI** is an advanced AI-powered Computer Vision and Body Measurement platform engineered specifically for the tailoring industry, boutique owners, fashion designers, and custom garment manufacturers.

The system estimates 20+ actual skin-level body circumferences and lengths required for stitching garments from uploaded photos or real-time camera video streams.

---

## ✨ Features

- **33-Point MediaPipe BlazePose GHUM Engine**: Real-time skeletal landmark tracking directly in the client browser canvas.
- **Ramanujan Ellipse Circumference Formula**: Fuses 2D Front view widths and 3D Side view depths using Ramanujan's ellipse perimeter approximation ($C \approx \pi [ 3(a+b) - \sqrt{(3a+b)(a+3b)} ]$).
- **20 Bespoke Tailoring Measurements**:
  - *Head & Neck*: Neck Circumference
  - *Upper Body*: Shoulder Width, Chest / Bust Circumference, Upper Chest Width, Armhole Circumference
  - *Arms*: Arm / Sleeve Length, Bicep, Elbow, Forearm, Wrist Circumference
  - *Torso*: Waist Circumference, Belly / Abdomen, Hip Circumference
  - *Lower Body*: Inseam Length, Outseam Length, Thigh, Knee, Calf, Ankle Circumferences
  - *Full Body*: Standing Height & Leg Length
- **Real-Time Live Video Scanner**: `getUserMedia` WebCam feed with posture quality validation HUD and auto-capture countdown timer.
- **Multi-Angle Photo Studio**: Multi-angle upload with Male & Female standard sample model presets.
- **Interactive 2D Landmark Overlay**: HTML5 Canvas rendering glowing keypoint nodes, skeleton mesh, and measurement callout lines with live $\text{cm} / \text{inches}$ unit toggles.
- **Printable Tailoring Specification Report**: Downloadable/printable PDF tech pack with QR code verification and metric specs table.
- **Tailor & Customer Dashboards**: Order workflow management (Pending, In Cutting, Stitching, Fitting Ready) and historical body fit trend tracker.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS Glassmorphism
- **Computer Vision**: Client-side Canvas 2D API + MediaPipe Pose spec engine
- **PDF & QR Export**: jsPDF + HTML2Canvas + QRCode React
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your system.

### Installation

```bash
# Clone the repository
git clone https://github.com/manojkm-77/tailorfit-ai.git
cd tailorfit-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 License

MIT License. Designed and developed for tailors and fashion designers worldwide.
