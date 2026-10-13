"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { RatingStars } from "@/components/product/rating-stars";
import { StarRatingInput } from "@/components/review/star-rating-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { loginHref } from "@/lib/catalog-params";
import { orpc, queryClient } from "@/utils/orpc";

interface ReviewSectionProps {
  productId: string;
  slug: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

function submitLabel(isPending: boolean, hasReview: boolean): string {
  if (isPending) {
    return "Saving…";
  }
  return hasReview ? "Update review" : "Post review";
}

export function ReviewSection({ productId, slug }: ReviewSectionProps) {
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;

  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  const reviewsQuery = useQuery(
    orpc.reviews.listReviews.queryOptions({ input: { page, productId } })
  );

  const myReviewQuery = useQuery(
    orpc.reviews.getMyReview.queryOptions({
      enabled: isSignedIn,
      input: { productId },
    })
  );

  const myReview = myReviewQuery.data ?? null;

  const startEditing = () => {
    if (!myReview) {
      return;
    }
    setRating(myReview.rating);
    setComment(myReview.comment ?? "");
    setEditing(true);
  };

  const upsertMutation = useMutation(
    orpc.reviews.upsertReview.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSuccess: async (result) => {
        toast.success(
          result.created
            ? "Thanks for your review!"
            : "Your review was updated."
        );
        setEditing(false);
        await queryClient.invalidateQueries();
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.reviews.deleteOwnReview.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSuccess: async () => {
        toast.success("Review deleted.");
        setRating(0);
        setComment("");
        setEditing(false);
        await queryClient.invalidateQueries();
      },
    })
  );

  const summary = reviewsQuery.data?.summary ?? { average: null, count: 0 };
  const items = reviewsQuery.data?.items ?? [];
  const pageMeta = reviewsQuery.data?.pageMeta;

  const showForm = isSignedIn && (editing || myReview === null);
  const canSubmit = rating >= 1 && !upsertMutation.isPending;

  const handleSubmit = () => {
    if (rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    upsertMutation.mutate({
      comment: comment.trim() || undefined,
      productId,
      rating,
    });
  };

  let reviewsList: ReactNode;
  if (reviewsQuery.status === "pending") {
    reviewsList = (
      <p className="text-muted-foreground text-sm">Loading reviews…</p>
    );
  } else if (items.length === 0) {
    reviewsList = (
      <p className="text-muted-foreground text-sm">
        No reviews yet. Be the first to share your thoughts.
      </p>
    );
  } else {
    reviewsList = (
      <ul className="flex flex-col divide-y">
        {items.map((review) => {
          const mine = myReview?.id === review.id;
          return (
            <li className="flex flex-col gap-2 py-5 first:pt-0" key={review.id}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium text-sm">
                  {review.customerName}
                </span>
                {review.verifiedPurchase ? (
                  <Badge className="gap-1 text-xs" variant="secondary">
                    <BadgeCheck className="size-3.5" />
                    Verified purchase
                  </Badge>
                ) : null}
                <span className="text-muted-foreground text-xs">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <RatingStars
                rating={{ average: review.rating, count: 1 }}
                showCount={false}
              />
              {review.comment ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {review.comment}
                </p>
              ) : null}
              {mine ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={startEditing}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    <PencilIcon data-icon />
                    Edit
                  </Button>
                  <Button
                    disabled={deleteMutation.isPending}
                    onClick={() =>
                      deleteMutation.mutate({ reviewId: review.id })
                    }
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon data-icon />
                    Delete
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  let pagination: ReactNode = null;
  if (pageMeta && pageMeta.totalPages > 1) {
    pagination = (
      <div className="flex items-center justify-between gap-4">
        <Button
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          size="sm"
          type="button"
          variant="outline"
        >
          Previous
        </Button>
        <span className="text-muted-foreground text-xs tabular-nums">
          Page {page} of {pageMeta.totalPages}
        </span>
        <Button
          disabled={page >= pageMeta.totalPages}
          onClick={() => setPage((value) => value + 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          Next
        </Button>
      </div>
    );
  }

  let panel: ReactNode;
  if (!isSignedIn) {
    panel = (
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm">Share your experience</h3>
        <p className="text-muted-foreground text-xs">
          Sign in to rate this watch and help other shoppers.
        </p>
        <Button
          className="w-fit"
          render={<Link href={loginHref(`/watches/${slug}`)} />}
          size="sm"
        >
          Sign in to review
        </Button>
      </div>
    );
  } else if (showForm) {
    panel = (
      <>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm">
            {myReview ? "Update your review" : "Write a review"}
          </h3>
          <p className="text-muted-foreground text-xs">
            One review per product. You can edit it anytime.
          </p>
        </div>
        <StarRatingInput onChange={setRating} value={rating} />
        <Textarea
          maxLength={2000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you think of this watch? (optional)"
          rows={4}
          value={comment}
        />
        <div className="flex items-center gap-2">
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            size="sm"
            type="button"
          >
            {submitLabel(upsertMutation.isPending, Boolean(myReview))}
          </Button>
          {myReview && editing ? (
            <Button
              onClick={() => setEditing(false)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </>
    );
  } else {
    panel = (
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm">Your review</h3>
        <p className="text-muted-foreground text-xs">
          You have already reviewed this watch.
        </p>
        <Button
          className="w-fit"
          onClick={startEditing}
          size="sm"
          type="button"
        >
          Edit your review
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-label="Customer reviews"
      className="flex flex-col gap-8"
      id="reviews"
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-xl tracking-tight">
          Customer reviews
        </h2>
        <RatingStars rating={summary} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {reviewsList}
          {pagination}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4 rounded-2xl border p-5">
            {panel}
          </div>
        </div>
      </div>
    </section>
  );
}
