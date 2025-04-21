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
  Filter,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReadOnlyRichTextViewer } from "@/components/ui/rich-text-editor";

export default function FeedbackList({ feedbacks }: any) {
  const [viewType, setViewType] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState<
    FeedbackDocument["status"] | "todos"
  >("todos");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  const capitalizeWords = (text: string | undefined) => {
    if (!text) return "";
    return text
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
        return "bg-yellow-500/10 hover:bg-yellow-500/20";
      case "em desenvolvimento":
        return "bg-blue-500/10 hover:bg-blue-500/20";
      case "concluido":
        return "bg-green-500/10 hover:bg-green-500/20";
      case "negado":
        return "bg-red-500/10 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 hover:bg-gray-500/20";
    }
  };

  const getBadgeColor = (status: FeedbackDocument["status"]) => {
    switch (status) {
      case "em aberto":
        return "bg-yellow-500 text-zinc-900 font-bold";
      case "em desenvolvimento":
        return "bg-blue-500 text-zinc-900 font-bold";
      case "concluido":
        return "bg-green-500 text-zinc-900 font-bold";
      case "negado":
        return "bg-red-500 text-zinc-900 font-bold";
      default:
        return "bg-gray-500 text-zinc-900 font-bold";
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback: any) => {
    // Apply status filter
    if (statusFilter !== "todos" && feedback.status !== statusFilter) {
      return false;
    }
    // Filter by user's own feedbacks
    if (showOnlyMine && feedback.userId !== feedback.currentUserId) {
      return false;
    }
    // Hide completed feedbacks
    if (
      (hideCompleted && feedback.status === "concluido") ||
      feedback.status === "negado"
    ) {
      return false;
    }
    return true;
  });

  const statusOrder: FeedbackDocument["status"][] = [
    "em aberto",
    "em desenvolvimento",
    "concluido",
    "negado",
  ];

  const groupedFeedbacks = filteredFeedbacks.reduce(
    (acc: any, feedback: any) => {
      if (!acc[feedback.status]) {
        acc[feedback.status] = [];
      }
      acc[feedback.status].push(feedback);
      return acc;
    },
    {} as Record<FeedbackDocument["status"], FeedbackDocument[]>
  );

  const renderFeedbackCard = (
    feedback: FeedbackDocument,
    isKanban: boolean = false
  ) => (
    <Card
      key={feedback._id}
      className={isKanban ? getStatusColor(feedback.status) : ""}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{feedback.title}</CardTitle>
          {!isKanban && (
            <Badge
              className={`flex items-center gap-2 ${getBadgeColor(
                feedback.status
              )}`}
            >
              {feedback.status && getStatusIcon(feedback.status)}
              {feedback.status && capitalizeWords(feedback.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <ReadOnlyRichTextViewer content={feedback.description} />
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {feedback.type && capitalizeWords(feedback.type)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {capitalizeWords(feedback.area)}
          </Badge>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Por: {feedback.userName} •{" "}
          {new Date(feedback.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredFeedbacks.map((feedback: any) =>
        renderFeedbackCard(feedback, false)
      )}
    </div>
  );

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusOrder.map((status) => (
        <div key={status} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon(status)}
            {capitalizeWords(status)} ({groupedFeedbacks[status]?.length || 0})
          </h3>
          <div className="space-y-4">
            {groupedFeedbacks[status]?.map((feedback: any) =>
              renderFeedbackCard(feedback, true)
            ) || []}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4" />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as FeedbackDocument["status"] | "todos")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="em aberto">Em Aberto</SelectItem>
              <SelectItem value="em desenvolvimento">
                Em Desenvolvimento
              </SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="negado">Negado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
                className="rounded border-gray-300"
              />
              Apenas meus feedbacks
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded border-gray-300"
              />
              Ocultar concluídos
            </label>
          </div>
        </div>

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
