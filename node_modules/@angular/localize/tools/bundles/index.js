
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  ArbTranslationSerializer,
  LegacyMessageIdMigrationSerializer,
  MessageExtractor,
  SimpleJsonTranslationSerializer,
  Xliff1TranslationSerializer,
  Xliff2TranslationSerializer,
  XmbTranslationSerializer,
  checkDuplicateMessages
} from "./chunk-TZHZOBVD.js";
import {
  ArbTranslationParser,
  SimpleJsonTranslationParser,
  Xliff1TranslationParser,
  Xliff2TranslationParser,
  XtbTranslationParser,
  makeEs2015TranslatePlugin,
  makeEs5TranslatePlugin,
  makeLocalePlugin
} from "./chunk-IVRM6V2B.js";
import {
  Diagnostics,
  buildLocalizeReplacement,
  isGlobalIdentifier,
  translate,
  unwrapExpressionsFromTemplateLiteral,
  unwrapMessagePartsFromLocalizeCall,
  unwrapMessagePartsFromTemplateLiteral,
  unwrapSubstitutionsFromLocalizeCall
} from "./chunk-HR5KPXEW.js";

// packages/localize/tools/index.ts
import { NodeJSFileSystem, setFileSystem } from "@angular/compiler-cli/private/localize";
setFileSystem(new NodeJSFileSystem());
export {
  ArbTranslationParser,
  ArbTranslationSerializer,
  Diagnostics,
  LegacyMessageIdMigrationSerializer,
  MessageExtractor,
  SimpleJsonTranslationParser,
  SimpleJsonTranslationSerializer,
  Xliff1TranslationParser,
  Xliff1TranslationSerializer,
  Xliff2TranslationParser,
  Xliff2TranslationSerializer,
  XmbTranslationSerializer,
  XtbTranslationParser,
  buildLocalizeReplacement,
  checkDuplicateMessages,
  isGlobalIdentifier,
  makeEs2015TranslatePlugin,
  makeEs5TranslatePlugin,
  makeLocalePlugin,
  translate,
  unwrapExpressionsFromTemplateLiteral,
  unwrapMessagePartsFromLocalizeCall,
  unwrapMessagePartsFromTemplateLiteral,
  unwrapSubstitutionsFromLocalizeCall
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
