export const userInfo = `query UserInfo {
  user{
    id
    login
  }
}`

export const userInfoQuery = `query UserInfoAndSkills($userId: Int!) {
  user: user_by_pk(id: $userId) {
    id
    login
    attrs
    email
    campus
    profile
    lastName
    firstName
    avatarUrl
    auditRatio
    totalUp
    totalUpBonus
    totalDown
    roles {
      slug
    }
    labels {
      labelName
      labelId
      eventId
    }
    records {
      startAt
      endAt
      message
      createdAt
      type {
        canAccessPlatform
        isPermanent
        canBeAuditor
        label
        type
      }
    }
    transactions(
      order_by: [{type: desc}, {amount: desc}]
      distinct_on: [type]
      where: {userId: {_eq: $userId}, type: {_like: "skill_%"}}
    ) {
      type
      amount
    }
  }
}`

export const dashboardQuery = `query DashboardQuery {
  user(limit: 1) {
    id
    login
    attrs
    firstName
    lastName
    email
    campus
    auditRatio
    totalUp
    totalDown
    totalUpBonus
    xpTotal: transactions_aggregate(where: { type: { _eq: "xp" } }) {
      aggregate {
        sum {
          amount
        }
      }
    }
    levelProgress: transactions(
      where: { type: { _eq: "level" } }
      order_by: [{ amount: desc }]
      limit: 1
    ) {
      amount
    }
    skillTransactions: transactions(
      order_by: [{ type: desc }, { amount: desc }]
      distinct_on: [type]
      where: { type: { _like: "skill_%" } }
    ) {
      type
      amount
    }
    recentTransactions: transactions(
      where: { type: { _eq: "xp" } }
      order_by: [{ createdAt: desc }]
      limit: 3
    ) {
      type
      amount
      createdAt
      path
    }
    records(order_by: [{ createdAt: desc }], limit: 5) {
      createdAt
      message
      type {
        label
        type
      }
    }
    labels(limit: 5, order_by: [{ eventId: desc }]) {
      eventId
    }
  }
}`

export const userExpAndLevelQuery = `query rootEventDetails($userId: Int!, $rootEventId: Int!) {
  xp: transaction_aggregate(
    where: {userId: {_eq: $userId}, type: {_eq: "xp"}, eventId: {_eq: $rootEventId}}
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
  level: transaction(
    limit: 1
    order_by: {amount: desc}
    where: {userId: {_eq: $userId}, type: {_eq: "level"}, eventId: {_eq: $rootEventId}}
  ) {
    amount
  }
}`