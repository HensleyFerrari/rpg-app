"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedbackDocument } from "@/models/Feedback";
import {
  AlertCircle,
  Bug,
  CheckCircle,
  Clock,
  ListFilter,
  Kanban,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function FeedbackList({
  feedbacks,
}: {
  feedbacks: FeedbackDocument[];
}) {
  const [viewType, setViewType] = useState<"list" | "kanban">("list");

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusIcon = (status: FeedbackDocument["status"]) => {
    switch (status) {
      case "em aberto":
        return <Clock className="h-4 w-4" />;
      case "em desenvolvimento":
        return <Bug className="h-4 w-4" />;
      case "concluido":
        return <CheckCircle className="h-4 w-4" />;
      case "negado":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: FeedbackDocument["status"]) => {
    switch (status) {
      case "em aberto":
        return "bg-yellow-500";
      case "em desenvolvimento":
        return "bg-blue-500";
      case "concluido":
        return "bg-green-500";
      case "negado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const groupedFeedbacks = feedbacks.reduce((acc, feedback) => {
    if (!acc[feedback.status]) {
      acc[feedback.status] = [];
    }
    acc[feedback.status].push(feedback);
    return acc;
  }, {} as Record<FeedbackDocument["status"], FeedbackDocument[]>);

  const renderFeedbackCard = (feedback: FeedbackDocument) => (
    <Card key={feedback._id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{feedback.title}</CardTitle>
          <Badge
            className={`flex items-center gap-2 ${getStatusColor(
              feedback.status
            )}`}
          >
            {getStatusIcon(feedback.status)}
            {capitalizeWords(feedback.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {feedback.description}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Por: {feedback.userName} •{" "}
          {new Date(feedback.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <div className="space-y-4">{feedbacks.map(renderFeedbackCard)}</div>
  );

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(groupedFeedbacks).map(([status, statusFeedbacks]) => (
        <div key={status} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon(status as FeedbackDocument["status"])}
            {capitalizeWords(status)} ({statusFeedbacks.length})
          </h3>
          <div className="space-y-4">
            {statusFeedbacks.map(renderFeedbackCard)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as "list" | "kanban")}
        >
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewType === "list" ? renderListView() : renderKanbanView()}
    </div>
  );
}
