<template>
  <div class="space-y-6">
    <PageHeader title="Customer Reviews" description="Manage and respond to customer feedback" />

    <!-- Loading State -->
    <div v-if="reviewStore.loading && !reviewStore.reviewsList.length" class="space-y-4">
      <Card v-for="i in 3" :key="i">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <Skeleton class="h-8 w-8 rounded-full" />
            <div class="space-y-1.5">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-full mb-2" />
          <Skeleton class="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Alert v-else-if="reviewStore.error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>{{ reviewStore.error }}</AlertDescription>
    </Alert>

    <!-- Reviews List -->
    <div v-else-if="reviewStore.reviewsList.length" class="space-y-4">
      <Card
        v-for="review in reviewStore.reviewsList"
        :key="review.id"
        class="transition-all duration-200 hover:shadow-md"
      >
        <!-- Review Header -->
        <CardHeader class="pb-3">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <Avatar class="h-8 w-8">
                <AvatarFallback class="text-xs font-bold">
                  {{ getInitials(review.user?.name) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium text-sm">{{ review.user?.name || "Anonymous User" }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(review.created_at) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <!-- Stars -->
              <div class="flex items-center gap-0.5">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="h-3.5 w-3.5"
                  :class="i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'"
                />
              </div>
              <Badge :variant="review.reply ? 'default' : 'secondary'" class="text-[10px]">
                {{ review.reply ? "Replied" : "Needs Response" }}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent class="pb-3">
          <p class="text-sm">{{ review.comments }}</p>
        </CardContent>

        <!-- Reply Section -->
        <div class="border-t">
          <!-- Existing Reply -->
          <div v-if="review.reply" class="px-6 py-4 bg-muted/50">
            <p class="text-xs font-medium text-muted-foreground mb-1.5">Your Reply</p>
            <p class="text-sm">{{ review.reply }}</p>
          </div>

          <!-- Reply Form -->
          <div v-else class="px-6 py-4 bg-muted/30">
            <form @submit.prevent="handleReply(review.id)" class="space-y-3">
              <textarea
                v-model="replyText[review.id]"
                rows="2"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Write your response..."
              ></textarea>
              <div class="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  :disabled="!replyText[review.id]?.trim() || isSubmitting[review.id]"
                >
                  <Send v-if="!isSubmitting[review.id]" class="h-3.5 w-3.5 mr-1.5" />
                  <Loader2 v-else class="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {{ isSubmitting[review.id] ? "Submitting..." : "Submit Reply" }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="!reviewStore.loading && !reviewStore.reviewsList.length"
      title="No Reviews"
      description="No customer reviews to display yet."
      :icon="MessageSquare"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useReviewStore } from "../../store/useReviewStore";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Send, Loader2, AlertCircle, MessageSquare } from "lucide-vue-next";

const reviewStore = useReviewStore();
const replyText = ref({});
const isSubmitting = ref({});

const getInitials = (name) => {
  if (!name) return "A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(async () => {
  try {
    await reviewStore.getBusinessReviews();
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }
});

const handleReply = async (reviewId) => {
  if (!replyText.value[reviewId]?.trim()) return;

  isSubmitting.value[reviewId] = true;
  try {
    await reviewStore.replyToReview(reviewId, replyText.value[reviewId]);
    replyText.value[reviewId] = "";
  } catch (error) {
    console.error("Failed to submit reply:", error);
  } finally {
    isSubmitting.value[reviewId] = false;
  }
};
</script>
