import {
    CharacterManager,
    Notifications,
    Utility } from 'charactersheet/utilities';
import { ChatServiceManager } from 'charactersheet/services/common';
import { PlayerTypes } from 'charactersheet/models/common';
import ko from 'knockout';
import template from './index.html';

export function ExhibitViewModel() {
    var self = this;

    self.name = ko.observable('');
    self.url = ko.observable('');
    self.isConnectedToParty = ko.observable(false);
    self.fullScreen = ko.observable(false);

    self.load = function() {
        Notifications.party.players.changed.add(self.exhibitGivenImage);
        Notifications.party.left.add(self.checkForParty);
        Notifications.party.joined.add(self.checkForParty);
        self.checkForParty();
    };

    self.unload = function() {
        Notifications.party.players.changed.remove(self.exhibitGivenImage);
        Notifications.party.left.remove(self.checkForParty);
        Notifications.party.joined.remove(self.checkForParty);
    };

    self.checkForParty = function() {
        var chat = ChatServiceManager.sharedService();
        self.isConnectedToParty(chat.currentPartyNode == null ? false : true);
    };

    self.toggleFullScreen = function() {
        self.fullScreen(!self.fullScreen());
    };

    self.exhibitGivenImage = function(pcards) {
        // Ignore non-DM cards and player is in a party
        if (!self.isConnectedToParty()) { return; }
        var dmCard = pcards.filter(function(card, idx, _) {
            return PlayerTypes.dmPlayerType.key == card.get('playerType')[0];
        })[0];

        var image = dmCard ? dmCard.get('exhibitImage')[0] : null;

        if (image) {
            if (image.name == self.name() && image.url == self.url()) {
                return;
            }
            self.name(image.name);
            self.url(Utility.string.createDirectDropboxLink(image.url));
            Notifications.userNotification.infoNotification.dispatch('New image on Exhibit', '');
        } else {
            self.name('');
            self.url('');
        }
    };
}

ko.components.register('exhibit', {
    viewModel: ExhibitViewModel,
    template: template
});
