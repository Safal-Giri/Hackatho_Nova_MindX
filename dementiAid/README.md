# DementiAid Frontend 

The DementiAid frontend is a powerful Angular application that provides a real-time, AI-augmented experience for dementia patients and caregivers.

---

##  Features

###  Real-Time HUD (Heads-Up Display)
- **Face Recognition**: Detects and recognizes registered faces in real-time using `face-api.js`.
- **Dynamic Overlays**: Displays subject name, relationship, and the most recent conversation memory as an interactive sci-fi overlay on the camera feed.
- **Auto-Summarization**: Detects speech using `webkitSpeechRecognition` (Web Speech API) and automatically triggers the backend AI to summarize conversations.
- **Voice Announcements**: Uses `window.speechSynthesis` (Web Speech API) to announce recognized subjects and their last conversation details.

###  People Management
- **Subject Directory**: View and manage all people recognized by the system.
- **Registration**: Capture subject faces via webcam for future recognition.
- **Relationship Data**: Store visit frequency and relationship status.

###  Memories
- **Conversation Logs**: Revisit summarized conversations to help the patient recall shared moments.
- **AI-Driven Summaries**: Uses Google Gemini to distill long conversations into readable, high-impact memories.

###  Medication Station
- **Caregiver Dashboard**: Manage medication dosages, frequencies, and precise timings.
- **Automated Alerts**: Syncs with the backend to trigger caregiver email notifications.

---

##  Technical Details
- **Framework**: Angular 18 (Standalone Components)
- **Styling**: Vanilla CSS3 with a custom, premium design system.
- **Computer Vision**: `face-api.js` (TensorFlow.js based) for real-time detection and recognition.
- **Routing**: Functional guards (`AuthGuard`) protect all dashboard routes.
- **Interceptors**: `AuthInterceptor` automatically attaches JWT tokens to outgoing API requests.

---

##  Navigation structure

- `/login`: Secure caregiver sign-in.
- `/register`: New caregiver registration.
- `/dashboard/overview`: The live AI HUD interface.
- `/dashboard/people`: Subject directory and face registration.
- `/dashboard/memories`: Historical conversation summaries.
- `/dashboard/medications`: Medication schedule management.

---

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   ng serve
   ```
3. Access the application at `http://localhost:4200`.

---

##  Design System

The application uses a custom-built, premium design system defined in `src/styles.css`. 
- **Typography**: Inter (Body), Outfit (Headings)
- **Colors**: Premium Slate (#0f172a) and Indigo (#4f46e5)
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile (collapsible sidebar).
