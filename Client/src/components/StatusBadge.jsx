import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toUpperCase();

  if (s === 'APPROVED') {
    return <span className="badge badge-approved">Approved</span>;
  }
  if (s === 'SUBMITTED' || s === 'UNDER_REVIEW' || s === 'READY_FOR_REVIEW') {
    return <span className="badge badge-submitted">Submitted</span>;
  }
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') {
    return <span className="badge badge-inprogress">In Progress</span>;
  }
  if (s === 'CORRECTION_REQUIRED' || s === 'RETURNED' || s === 'RETURNED FOR CORRECTION') {
    return <span className="badge badge-returned">Returned for Correction</span>;
  }
  if (s === 'DRAFT' || s === 'NOT_STARTED' || s === 'NOT STARTED') {
    return <span className="badge badge-draft">Not Started</span>;
  }
  if (s === 'PENDING WINDOW') {
    return <span className="badge badge-neutral">Pending Window</span>;
  }

  return <span className="badge badge-neutral">{status}</span>;
};

export default StatusBadge;
