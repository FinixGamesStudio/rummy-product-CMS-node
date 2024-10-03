export interface LobbyType {
    _id: string;
    lobbyType: string;
    type: string;
    lobbyTypeIcon: string;
    lobbyTypeIconKey: string;
    description: string;
}


export interface UpdateLobbyType {
    lobbyType?: string;
    type?: string;
    lobbyTypeIcon?: string;
    lobbyTypeIconKey?: string;
    description?: string;
}