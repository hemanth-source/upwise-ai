import React from "react";

const TopicExplainerPage = () => {
  return (
    <div className="w-full h-[calc(100vh-8rem)] rounded-xl overflow-hidden border bg-card">
      <iframe
        src="https://aura-glrg.vercel.app/"
        className="w-full h-full border-0"
        title="Topic Explainer Avatar"
        allow="microphone; camera"
      />
    </div>
  );
};

export default TopicExplainerPage;
