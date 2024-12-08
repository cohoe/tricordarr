import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';

export const LfgParticipationHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true}>
        <HelpTopicView>Don't just add random people to your LFG. It's not nice.</HelpTopicView>
        <HelpTopicView>If you add people to your LFG, those people should already expect to be added.</HelpTopicView>
        <HelpTopicView>
          Same idea with removing people: those removed should know why. Don't remove people who signed up just to bump
          your friend off the waitlist.
        </HelpTopicView>
        <HelpTopicView>
          If you schedule a "Drink Like a Pirate" LFG and someone joins and asks if they can come as a ninja instead,
          you may tell them it's more of a pirate thing and you may need to remove them to make room for more pirate
          participants.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
