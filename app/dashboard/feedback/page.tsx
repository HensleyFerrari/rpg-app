import { getAllFeedbacks } from "@/lib/actions/feedback.actions";
import FeedbackForm from "./components/feedback-form";
import FeedbackList from "./components/feedback-list";

export default async function FeedbackPage() {
  const { data: feedbacks } = await getAllFeedbacks();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Enviar Feedback</h1>
        <p className="mb-4">Envie seu feedback para nós!</p>
        <FeedbackForm />
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Feedbacks Enviados</h2>
        <FeedbackList feedbacks={feedbacks} />
      </div>
    </div>
  );
}
