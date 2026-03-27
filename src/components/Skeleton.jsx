import React from 'react';
import { S } from '../styles';

export function SkeletonBox({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--dark3)',
        ...style,
      }}
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div style={{ ...S.card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <SkeletonBox width="60%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonBox width="90%" height={13} />
          <SkeletonBox width="70%" height={13} style={{ marginTop: 4 }} />
        </div>
        <SkeletonBox width={70} height={24} radius={4} />
      </div>
      <div style={{ borderTop: '1px solid #2A2520', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width={60} height={12} />
        <SkeletonBox width={70} height={28} radius={8} />
      </div>
    </div>
  );
}

export function BarberCardSkeleton() {
  return (
    <div style={{ ...S.card, padding: 20, textAlign: 'center' }}>
      <SkeletonBox width={64} height={64} radius="50%" style={{ margin: '0 auto 16px' }} />
      <SkeletonBox width="50%" height={18} style={{ margin: '0 auto 6px' }} />
      <SkeletonBox width="30%" height={11} style={{ margin: '0 auto 12px' }} />
      <SkeletonBox width="80%" height={13} style={{ margin: '0 auto 4px' }} />
      <SkeletonBox width="60%" height={13} style={{ margin: '0 auto 4px' }} />
      <SkeletonBox width={120} height={38} radius={8} style={{ margin: '20px auto 0' }} />
    </div>
  );
}

export function BarberListSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...S.card, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <SkeletonBox width={50} height={50} radius="50%" />
          <div style={{ flex: 1 }}>
            <SkeletonBox width="40%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBox width="25%" height={11} />
          </div>
          <SkeletonBox width={20} height={20} radius="50%" />
        </div>
      ))}
    </div>
  );
}

export function ServiceListSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...S.card, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <SkeletonBox width="50%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBox width="30%" height={12} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SkeletonBox width={60} height={20} />
            <SkeletonBox width={20} height={20} radius="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      <SkeletonBox width="30%" height={28} style={{ marginBottom: 12 }} />
      <SkeletonBox width="50%" height={14} style={{ marginBottom: 32 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SkeletonBox height={80} />
        <SkeletonBox height={80} />
        <SkeletonBox height={80} />
      </div>
    </div>
  );
}
