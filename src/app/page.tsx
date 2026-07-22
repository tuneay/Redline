import { ChatShell } from "@/components/chat/ChatShell";
import { MotionProvider } from "@/components/motion";

export default function Home() {
  return (
    <MotionProvider>
      <ChatShell />
    </MotionProvider>
  );
}
