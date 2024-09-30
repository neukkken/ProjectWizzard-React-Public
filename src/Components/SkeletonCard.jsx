import React from 'react';
import { CCard, CCardBody, CCardImage, CCardTitle, CCardText } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';

const SkeletonCard = () => {
  return (
    <CCard className="project-overview-card skeleton-card">
      <CCardBody>
        <CCardTitle className="skeleton-title"></CCardTitle>
        <CCardText className="skeleton-text"></CCardText>
        <CCardText className="skeleton-text"></CCardText>
        <div className="skeleton-button"></div>
      </CCardBody>
    </CCard>
  );
};

export default SkeletonCard;
