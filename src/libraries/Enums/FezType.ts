/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/FezType.swift
 * These have to stay lower-case in the values since those are what get POST'd to the server.
 */
export enum FezType {
  announcement = 'announcement',
  /// A closed chat. Participants are set at creation and can't be changed. No location, start/end time, or capacity.
  closed = 'closed',
  /// An open chat. Participants can be added/removed after creation *and your UI should make this clear*. No location, start/end time, or capacity.
  open = 'open',
  /// Some type of activity.
  activity = 'activity',
  /// A dining LFG.
  dining = 'dining',
  /// A gaming LFG.
  gaming = 'gaming',
  /// A general meetup.
  meetup = 'meetup',
  /// A music-related LFG.
  music = 'music',
  /// Some other type of LFG.
  other = 'other',
  /// A shore excursion LFG.
  shore = 'shore',
}

export namespace FezType {
  export const getLabel = (fezType?: FezType) => {
    switch (fezType) {
      default:
        if (!fezType) {
          return 'Unknown';
        }
        return fezType.charAt(0).toUpperCase() + fezType.slice(1);
    }
  };
}
