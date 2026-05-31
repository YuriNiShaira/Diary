import React from 'react';

export interface BucketListItem {
  id: number;
  title: string;
  description: string;
  category: string;
  category_display: string;
  added_by: string;
  added_by_display: string;
  status: string;
  status_display: string;
  priority: number;
  priority_display: string;
  completed_at: string | null;
  completed_by: string | null;
  completion_notes: string;
  image: string | null;
  target_date: string | null;
  created_at: string;
}

export interface BucketListStats {
  total: number;
  completed: number;
  pending: number;
  planned: number;
  by_category: Record<string, number>;
  completion_rate: number;
}

export interface BucketListFormData {
  title: string;
  description: string;
  category: string;
  priority: number;
  target_date: string;
}

export interface Category {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  darkColor: string;
}
