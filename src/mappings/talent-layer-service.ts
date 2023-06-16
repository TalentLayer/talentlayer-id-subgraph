import { store, DataSourceContext } from '@graphprotocol/graph-ts'
import { Platform } from '../../generated/schema'
import { ServiceData, ProposalData } from '../../generated/templates'
import {
  ServiceCreated,
  ServiceCreated1 as ServiceCreatedWithTestUpgrade,
  ProposalCreated,
  AllowedTokenListUpdated,
  MinCompletionPercentageUpdated,
  ServiceUpdated,
  ProposalUpdated,
  ServiceCreatedWithReferral,
  ServiceDetailedUpdated,
  ProposalCreatedWithReferrer,
  ProposalUpdatedWithReferrer,
} from '../../generated/TalentLayerService/TalentLayerService'
import {
  getOrCreateService,
  getOrCreateProposal,
  getOrCreateToken,
  getOrCreatePlatform,
  getOrCreateUser,
  getOrCreateProtocol,
  getOrCreateUserStat,
} from '../getters'
import { generateIdFromTwoElements } from './utils'
import { ONE, ZERO } from '../constants'

// =================== Legacy V1 Events ===================
export function handleServiceCreated(event: ServiceCreated): void {
  const buyerStats = getOrCreateUserStat(event.params.ownerId)
  buyerStats.numCreatedServices = buyerStats.numCreatedServices.plus(ONE)
  buyerStats.save()

  const service = getOrCreateService(event.params.id)
  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.buyer = getOrCreateUser(event.params.ownerId).id
  service.status = 'Opened'
  const platform = getOrCreatePlatform(event.params.platformId)
  service.platform = platform.id
  service.cid = event.params.dataUri
  const dataId = event.params.dataUri + '-' + event.block.timestamp.toString()

  const context = new DataSourceContext()
  context.setBigInt('serviceId', event.params.id)
  context.setString('id', dataId)
  ServiceData.createWithContext(event.params.dataUri, context)

  service.description = dataId
  service.save()
}

export function handleServiceDetailedUpdated(event: ServiceDetailedUpdated): void {
  const serviceId = event.params.id
  const service = getOrCreateService(serviceId)
  const oldCid = service.cid
  const newCid = event.params.dataUri
  const dataId = newCid + '-' + event.block.timestamp.toString()

  //service.created set in handleServiceCreated.
  service.updatedAt = event.block.timestamp
  service.cid = newCid

  const context = new DataSourceContext()
  context.setBigInt('serviceId', serviceId)
  context.setString('id', dataId)

  if (oldCid) {
    store.remove('ServiceDescription', oldCid)
  }

  ServiceData.createWithContext(newCid, context)

  service.description = dataId
  service.save()
}

export function handleProposalCreated(event: ProposalCreated): void {
  const sellerStats = getOrCreateUserStat(event.params.ownerId)
  sellerStats.numCreatedProposals = sellerStats.numCreatedProposals.plus(ONE)
  sellerStats.save()

  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.status = 'Pending'

  proposal.service = getOrCreateService(event.params.serviceId).id
  proposal.seller = getOrCreateUser(event.params.ownerId).id
  // Handled in getOrCreateProposal
  proposal.rateToken = getOrCreateToken(event.params.rateToken).id
  proposal.rateAmount = event.params.rateAmount
  proposal.platform = Platform.load(event.params.platformId.toString())!.id
  proposal.expirationDate = event.params.expirationDate

  proposal.createdAt = event.block.timestamp
  proposal.updatedAt = event.block.timestamp

  const cid = event.params.dataUri
  proposal.cid = cid

  const dataId = cid + '-' + event.block.timestamp.toString()
  proposal.description = dataId

  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)
  context.setString('id', dataId)
  ProposalData.createWithContext(cid, context)

  proposal.save()
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  const token = event.params.rateToken
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  const newCid = event.params.dataUri
  const oldCid = proposal.cid
  const dataId = newCid + '-' + event.block.timestamp.toString()

  proposal.rateToken = getOrCreateToken(token).id
  proposal.rateAmount = event.params.rateAmount

  //proposal.created set in handleProposalCreated.
  proposal.updatedAt = event.block.timestamp

  proposal.cid = newCid
  proposal.expirationDate = event.params.expirationDate
  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)
  context.setString('id', dataId)

  if (oldCid) {
    store.remove('ProposalDescription', oldCid)
  }

  ProposalData.createWithContext(newCid, context)

  proposal.description = dataId
  proposal.save()
}

// =================== V2 Events ===================

export function handleServiceCreatedWithReferral(event: ServiceCreatedWithReferral): void {
  const buyerStats = getOrCreateUserStat(event.params.ownerId)
  buyerStats.numCreatedServices = buyerStats.numCreatedServices.plus(ONE)
  buyerStats.save()

  const service = getOrCreateService(event.params.id)
  service.rateToken = getOrCreateToken(event.params.rateToken).id
  service.referralAmount = event.params.referralAmount
  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.buyer = getOrCreateUser(event.params.ownerId).id
  service.status = 'Opened'
  const platform = getOrCreatePlatform(event.params.platformId)
  service.platform = platform.id
  service.cid = event.params.dataUri
  const dataId = event.params.dataUri + '-' + event.block.timestamp.toString()

  const context = new DataSourceContext()
  context.setBigInt('serviceId', event.params.id)
  context.setString('id', dataId)
  ServiceData.createWithContext(event.params.dataUri, context)

  service.description = dataId
  service.save()
}

export function handleServiceCreatedWithReferralTest(event: ServiceCreatedWithTestUpgrade): void {
  const buyerStats = getOrCreateUserStat(event.params.ownerId)
  buyerStats.numCreatedServices = buyerStats.numCreatedServices.plus(ONE)
  buyerStats.save()

  const service = getOrCreateService(event.params.id)
  service.rateToken = getOrCreateToken(event.params.rateToken).id
  service.referralAmount = event.params.referralAmount
  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.buyer = getOrCreateUser(event.params.ownerId).id
  service.status = 'Opened'
  const platform = getOrCreatePlatform(event.params.platformId)
  service.platform = platform.id
  service.cid = event.params.dataUri
  const dataId = event.params.dataUri + '-' + event.block.timestamp.toString()

  const context = new DataSourceContext()
  context.setBigInt('serviceId', event.params.id)
  context.setString('id', dataId)
  ServiceData.createWithContext(event.params.dataUri, context)

  service.description = dataId
  service.save()
}

export function handleServiceUpdated(event: ServiceUpdated): void {
  const serviceId = event.params.id
  const service = getOrCreateService(serviceId)
  const oldCid = service.cid
  const newCid = event.params.dataUri
  const dataId = newCid + '-' + event.block.timestamp.toString()

  //service.created set in handleServiceCreated.
  service.updatedAt = event.block.timestamp
  service.cid = newCid
  service.referralAmount = event.params.referralAmount

  const context = new DataSourceContext()
  context.setBigInt('serviceId', serviceId)
  context.setString('id', dataId)

  if (oldCid) {
    store.remove('ServiceDescription', oldCid)
  }

  ServiceData.createWithContext(newCid, context)

  service.description = dataId
  service.save()
}

export function handleProposalCreatedWithReferrer(event: ProposalCreatedWithReferrer): void {
  const sellerStats = getOrCreateUserStat(event.params.ownerId)
  sellerStats.numCreatedProposals = sellerStats.numCreatedProposals.plus(ONE)
  sellerStats.save()

  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.status = 'Pending'

  proposal.service = getOrCreateService(event.params.serviceId).id
  proposal.seller = getOrCreateUser(event.params.ownerId).id
  proposal.rateAmount = event.params.amount
  proposal.platform = Platform.load(event.params.platformId.toString())!.id
  proposal.expirationDate = event.params.expirationDate
  if (event.params.referrerId != ZERO) {
    proposal.referrer = getOrCreateUser(event.params.referrerId).id
  }

  proposal.createdAt = event.block.timestamp
  proposal.updatedAt = event.block.timestamp

  const cid = event.params.dataUri
  proposal.cid = cid

  const dataId = cid + '-' + event.block.timestamp.toString()
  proposal.description = dataId

  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)
  context.setString('id', dataId)
  ProposalData.createWithContext(cid, context)

  proposal.save()
}

export function handleProposalUpdatedWithReferrer(event: ProposalUpdatedWithReferrer): void {
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  const newCid = event.params.dataUri
  const oldCid = proposal.cid
  const dataId = newCid + '-' + event.block.timestamp.toString()

  proposal.rateAmount = event.params.amount
  if (event.params.referrerId != ZERO) {
    proposal.referrer = getOrCreateUser(event.params.referrerId).id
  }

  //proposal.created set in handleProposalCreated.
  proposal.updatedAt = event.block.timestamp

  proposal.cid = newCid
  proposal.expirationDate = event.params.expirationDate
  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)
  context.setString('id', dataId)

  if (oldCid) {
    store.remove('ProposalDescription', oldCid)
  }

  ProposalData.createWithContext(newCid, context)

  proposal.description = dataId
  proposal.save()
}

export function handleAllowedTokenListUpdated(event: AllowedTokenListUpdated): void {
  const token = getOrCreateToken(event.params.tokenAddress)
  token.allowed = event.params.isWhitelisted
  token.minimumTransactionAmount = event.params.minimumTransactionAmount

  token.save()
}

export function handleMinCompletionPercentageUpdated(event: MinCompletionPercentageUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.minServiceCompletionPercentage = event.params.minCompletionPercentage
  protocol.save()
}
