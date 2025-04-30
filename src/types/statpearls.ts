/**
 * Type definitions for StatPearls article parsing
 */

/**
 * Represents author information
 */
export interface Author {
  name: string;
  affiliation?: string;
}

/**
 * Represents publication details
 */
export interface PublicationDetails {
  lastUpdate: string;
  publisher: string;
  publicationYear: string;
  publicationLocation?: string;
}

/**
 * Represents a reference citation
 */
export interface Reference {
  id: string;
  number: number;
  text: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  url?: string;
}

/**
 * Represents a figure in the article
 */
export interface Figure {
  id: string;
  caption: string;
  imageUrl: string;
  altText?: string;
  largeImageUrl?: string;
  attribution?: string;
}

/**
 * Represents a table in the article
 */
export interface Table {
  id: string;
  caption: string;
  tableHtml: string;
  tableUrl?: string;
}

/**
 * Represents a subsection within a main section
 */
export interface Subsection {
  title: string;
  content: string;
}

/**
 * Represents a main section of the article
 */
export interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Subsection[];
  figures: Figure[];
  tables: Table[];
  level: number;
}

/**
 * Represents the objectives of the article
 */
export interface Objectives {
  items: string[];
}

/**
 * Represents the complete parsed StatPearls article
 */
export interface StatPearlsArticle {
  title: string;
  authors: Author[];
  publicationDetails: PublicationDetails;
  abstract?: string;
  objectives?: Objectives;
  introduction?: string;
  sections: Section[];
  references: Reference[];
  copyright: string;
  disclosures?: string[];
  url: string;
  articleId: string; // The NBK ID
}

/**
 * Represents a search result from StatPearls
 */
export interface StatPearlsSearchResult {
  title: string;
  url: string;
  description?: string;
  authors?: string[];
  publicationDate?: string;
  articleId?: string; // The NBK ID if available
}