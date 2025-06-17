// Define types for our enhanced auction platform

export type AuctionType = "forward" | "reverse"

export type ForwardAuctionSubType = "english" | "dutch" | "sealed" | "multi-round" | "silent"
export type ReverseAuctionSubType =
  | "standard"
  | "japanese"
  | "vickrey"
  | "ranked"
  | "tco-based"
  | "sealed-bid"
  | "reverse-clock"

export type AuctionSubType = ForwardAuctionSubType | ReverseAuctionSubType

export type ParticipationType = "public" | "verified" | "invite-only"
export type LaunchType = "immediate" | "scheduled"
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "INR" | "AUD" | "CNY"
export type Language = "en" | "fr" | "es" | "hi" | "de" | "zh" | "ja" | "ar"

// New types for product attributes and classification
export type ProductAttribute = {
  id: string
  name: string
  value: string
  type: "text" | "number" | "select" | "color" | "boolean"
  required: boolean
  options?: string[] // For select type attributes
}

export type ProductCategory = {
  id: string
  name: string
  parentId?: string
  level: number
  subcategories?: ProductCategory[]
}

export type BidIncrementType = "fixed" | "percentage" | "range-based"

export type BidIncrementRule = {
  id: string
  minBidAmount: number
  maxBidAmount?: number
  incrementValue: number
  incrementType: BidIncrementType
}

export interface AuctionDuration {
  days: number
  hours: number
  minutes: number
}

export interface QualificationCriteria {
  id: string
  name: string
  description: string
  required: boolean
}

export interface TermsAndCondition {
  id: string
  title: string
  content: string
  required: boolean
}

export interface LotItem {
  id: string
  name: string
  description: string
  quantity: number
  startPrice: number
  minimumIncrement: number
  images: UploadedFile[]
  documents: UploadedFile[]
  // New product classification fields
  categoryId: string
  subCategoryId?: string
  attributes: ProductAttribute[]
  sku?: string
  brand?: string
  model?: string
}

export interface AuctionTemplate {
  id: string
  name: string
  description: string
  auctionType: AuctionType
  auctionSubType: AuctionSubType
  auctionDuration: AuctionDuration
  currency: Currency
  participationType: ParticipationType
  qualificationCriteria: QualificationCriteria[]
  termsAndConditions: TermsAndCondition[]
  createdAt: string
  isDefault?: boolean
}

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export interface AuctionFormData {
  // Step 1: Auction Type
  auctionType: AuctionType
  auctionSubType: AuctionSubType
  templateId?: string // If using a template

  // Step 2: Product/Lot Details (moved from step 3)
  isMultiLot: boolean // Single lot or multiple lots
  productName: string // Used for single lot
  productDescription: string // Used for single lot
  productImages: UploadedFile[] // Used for single lot
  productDocuments: UploadedFile[] // Used for single lot
  lots: LotItem[] // Used for multi-lot auctions
  // New product classification fields
  categoryId: string
  subCategoryId?: string
  attributes: ProductAttribute[]
  sku?: string
  brand?: string
  model?: string

  // Step 3: Bidding Parameters (moved from step 2)
  startPrice: number
  minimumIncrement: number
  auctionDuration: AuctionDuration
  currency: Currency
  launchType: LaunchType
  scheduledStart: string // ISO string format
  bidExtension: boolean // Enable bid extension to prevent sniping
  bidExtensionTime: number // Minutes to extend auction if bid received in last X minutes
  allowAutoBidding: boolean // Allow automated bidding
  reservePrice?: number // Optional reserve price
  // New bid increment flexibility
  bidIncrementType: BidIncrementType
  bidIncrementRules: BidIncrementRule[]
  // Silent auction mode for forward auctions
  isSilentAuction: boolean

  // Step 4: Participation Rules
  participationType: ParticipationType
  participantEmails: string[] // For invite-only
  qualificationCriteria: QualificationCriteria[] // Requirements for participants

  // Step 5: Terms & Conditions
  termsAndConditions: TermsAndCondition[]
  enableDispute: boolean // Enable dispute resolution

  // Additional Settings
  language: Language
  enableNotifications: boolean
  notificationTypes: string[] // Email, SMS, Push
  enableAnalytics: boolean
}

// New types for API authentication
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  role: "admin" | "auctioneer" | "bidder"
  permissions: string[]
}

export interface BidData {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  timestamp: string
  isWinning: boolean
  isVisible: boolean // For silent auctions
}
