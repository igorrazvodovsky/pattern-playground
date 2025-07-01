import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { PpToast } from "../../main.ts";
import { AICommandEmpty } from "../../components/command-menu/ai-command-empty";
import { drawerService } from "../../services/drawer-service";

const meta = {
  title: "Test/Toast Drawer Integration",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const TestAICommandWrapper = () => {
  // Mock AI state
  const mockAIState = {
    isProcessing: false,
    result: null,
    error: null,
    hasUnresolvedQuery: false
  };

  return (
    <div>
      <AICommandEmpty
        searchInput="test"
        aiState={mockAIState}
        onAIRequest={() => Promise.resolve({ suggestedItems: [], confidence: 0 })}
        onApplyAIResult={() => {}}
        onEditPrompt={() => {}}
        onInputChange={() => {}}
        onClose={() => {}}
      />
      <button 
        className="button"
        onClick={() => {
          const message = "Test task from button";
          PpToast.show(message, () => {
            console.log("This callback should open the drawer");
            drawerService.open(message);
          });
        }}
      >
        Test Toast with Global Drawer Service
      </button>
    </div>
  );
};

export const DrawerTest: Story = {
  render: () => {
    // Mock AI state
    const mockAIState = {
      isProcessing: false,
      result: null,
      error: null,
      hasUnresolvedQuery: false
    };

    return (
      <div className="inline-flow">
        <button
          className="button"
          onClick={() => {
            PpToast.show("Test message", () => {
              console.log("Toast clicked - drawer should open");
              drawerService.open("Test message from global service");
            });
          }}
        >
          Show Toast with Global Drawer
        </button>
        
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>AI Command Component (with drawer)</h3>
          <TestAICommandWrapper />
        </div>
      </div>
    );
  },
};