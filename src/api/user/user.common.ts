import mongoose from "mongoose";
import { TOURNAMENT_CONSTANT, USER_CONSTANT } from '../../constant';


class UserCommon {
  public aggregateGetGameStatistics = async (matchQuery: any) => {
    return [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'tournaments',
          localField: 'tournamentId',
          foreignField: '_id',
          as: 'tournaments'
        }
      },
      {
        $unwind: {
          path: '$tournaments'
        }
      },
      {
        $group: {
          _id: null,
          totalCount: {
            $sum: 1
          },
          concepts: {
            $push: '$$ROOT'
          }
        }
      },
      {
        $unwind: {
          path: '$concepts'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                totalCount: '$totalCount'
              },
              '$concepts'
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            tournamentId: '$tournamentId',
            win: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$status', 'win']
                  },
                  1,
                  0
                ]
              }
            },
            loss: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$status', 'loss']
                  },
                  1,
                  0
                ]
              }
            },
            tie: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$status', 'tie']
                  },
                  1,
                  0
                ]
              }
            },
            H2H: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$tournaments.eventType', 'Single']
                  },
                  1,
                  0
                ]
              }
            }
          },
          totalCount: {
            $first: '$totalCount'
          }
        }
      },
      {
        $group: {
          _id: null,
          H2H: {
            $sum: '$_id.H2H'
          },
          tournament: {
            $sum: 1
          },
          win: {
            $sum: '$_id.win'
          },
          loss: {
            $sum: '$_id.loss'
          },
          tie: {
            $sum: '$_id.tie'
          },
          totalCount: {
            $first: '$totalCount'
          }
        }
      },
      {
        $project: {
          _id: 0,
          H2H: 1,
          tournament: 1,
          win: 1,
          loss: 1,
          tie: 1,
          totalCount: 1
        }
      }
    ];
  };

  public aggregateGetGameStatisticsOverview = async (matchQuery: any) => {
    return [
      {
        $match: matchQuery
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%G-%m-%d',
              date: '$createdAt'
            }
          },
          loss: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', 'loss']
                },
                1,
                0
              ]
            }
          },
          win: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', 'win']
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: '$date',
          win: {
            $sum: {
              $cond: [
                {
                  $eq: ['$win', 1]
                },
                1,
                0
              ]
            }
          },
          loss: {
            $sum: {
              $cond: [
                {
                  $eq: ['$loss', 1]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          win: 1,
          loss: 1
        }
      }
    ];
  };

  public aggregateGetGamesPlayed = async (
    matchQuery: any,
    matchKey: string
  ) => {
    const matchLookup: any = {
      $and: [
        {
          $eq: ['$_id', '$$tournamentId']
        }
      ]
    };
    switch (matchKey) {
      case 'H2H':
        matchLookup.$and.push({ $eq: ['$eventType', 'Single'] });
        break;

      case 'tournament':
        matchLookup.$and.push({
          $ne: ['$eventType', 'Single']
        });
        break;

      default:
        break;
    }
    return [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'games',
          let: {
            gameId: '$gameId'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$gameId']
                }
              }
            },
            {
              $project: {
                _id: 0,
                gameName: 1
              }
            }
          ],
          as: 'game'
        }
      },
      {
        $lookup: {
          from: 'tournaments',
          let: {
            tournamentId: '$tournamentId'
          },
          pipeline: [
            {
              $match: {
                $expr: matchLookup
              }
            },
            {
              $project: {
                _id: 1,
                eventType: 1
              }
            }
          ],
          as: 'tournament'
        }
      },
      {
        $unwind: {
          path: '$game'
        }
      },
      {
        $unwind: {
          path: '$tournament'
        }
      },
      {
        $project: {
          gameId: 1,
          gameName: '$game.gameName',
          tableId: '$_id',
          tournamentType: '$tournament.eventType',
          userCount: '2',
          result: '$status'
        }
      }
    ];
  };

  public aggregateGetGameStatisticsList = async (userId: any) => {
    const aggregateGetGameStatisticsList: any = [
      {
        $match: {
          'userId': new mongoose.Types.ObjectId(userId)
        }
      }, {
        $lookup: {
          from: "games",
          localField: "gameId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $unwind: "$result",
      },
      {
        $lookup: {
          from: "lobbytypes",
          localField: "lobbyType",
          foreignField: "_id",
          as: "lobbyTypeData",
        },
      },
      {
        $unwind: "$lobbyTypeData",
      },
      {
        $group: {
          _id: "$gameId",
          name: { $first: "$result.gameName" },
          gameId: { $push: "$result._id" },
          lobbyType: { $push: "$lobbyType" },
          winStatus: { $push: "$winStatus" },
          headToHead: { $sum: { $cond: [{ $eq: [TOURNAMENT_CONSTANT.LOBBY_TYPE.headToHead, "$lobbyTypeData.type"] }, 1, 0] } },
          tournament: { $sum: { $cond: [{ $eq: [TOURNAMENT_CONSTANT.LOBBY_TYPE.contest, "$lobbyTypeData.type"] }, 1, 0] } },
          totalLoss: { $sum: { $cond: [{ $eq: ["Loss", "$winStatus"] }, 1, 0] } },
          totalWin: { $sum: { $cond: [{ $eq: ["Win", "$winStatus"] }, 1, 0] } },
          totalTie: { $sum: { $cond: [{ $eq: ["Tie", "$winStatus"] }, 1, 0] } },
          totalRefund: { $sum: { $cond: [{ $eq: ["Refund", "$winStatus"] }, 1, 0] } },
        },
      },
      {
        $project: {
          gameName: "$name",
          headToHead: "$headToHead",
          contest: "$tournament",
          totalLoss: "$totalLoss",
          totalWin: "$totalWin",
          totalTie: "$totalTie",
          totalRefund: "$totalRefund",
          totalPlayed: { $size: "$gameId" },
        },
      },
    ]
    return aggregateGetGameStatisticsList
  };

  public aggregateUserKYCList = async (startDate: any, endDate: any) => {
    return [
      {
        $match: {
          role: USER_CONSTANT.ROLES.user,
          isBot: false
        }
      },
      {
        $lookup: {
          from: 'userkycaadharcards',
          localField: '_id',
          foreignField: 'userId',
          as: 'aadahrCard'
        }
      },
      {
        $unwind: {
          path: '$aadahrCard',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'userkycpancards',
          localField: '_id',
          foreignField: 'userId',
          as: 'panCard'
        }
      },
      {
        $unwind: {
          path: '$panCard',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {}
      },
      {
        $group: {
          _id: '$_id',
          aadharCardNumber: { $first: '$aadahrCard.aadharCardNumber' },
          panCardNumber: { $first: '$panCard.panCardNumber' },
          userName: { $first: '$fullName' },
          nickName: { $first: '$nickName' },
          aadharCardstatus: { $first: '$aadahrCard.status' },
          aadharCardFrontImage: { $first: '$aadahrCard.aadharCardFrontImage' },
          aadharCardBackImage: { $first: '$aadahrCard.aadharCardBackImage' },
          panCardImage: { $first: '$panCard.panCardImage' },
          panCardStatus: { $first: '$panCard.status' },
          date: { $first: '$createdAt' },
        }
      }, {
        $sort: {
          _id: -1,
        },
      },
    ]
  }

  public aggregateWithdrawRequests = async (matchQuery: any) => {
    return [
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
          totalamountBeforeProccessingFee: {
            $sum: "$amountBeforeProccessingFee",
          },
          totalProcessingFee: {
            $sum: "$processingFee",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          totalProcessingFee: 1,
          totalamountBeforeProccessingFee: 1
        },
      }
    ]
  }
}

export default UserCommon;
