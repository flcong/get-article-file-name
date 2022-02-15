# Changelog
All notable changes to this project will be documented in this file starting from version 2.0.5.

## [2.0.9] - 2022-02-15
### Added
- Support for acm.org and ieee.org
### Changed
- In the definition of `shortjournal`, if `fulljournal` contains only uppercase letters, then `shortjournal` is identical to `fulljournal`.

## [2.0.8] - 2022-01-19
### Changed
- Wiley changed the format of their website, so another method is implemented to parse author names.
- Integrate code to get last name from full name.

## [2.0.7] - 2021-12-09
### Changed
- Fix the bug in the change of version 2.0.6: stop words should be replaced by space and then trimed.


## [2.0.6] - 2021-12-09
### Changed
- When removing "and", "of", and "the" to get journal name abbreviation, check if they are part of another word. Otherwise, the word "theory" will become "ory" and "o" will be used as the first letter of the word.

## [2.0.5] - 2021-09-29
### Added
- Support for Arxiv.org
- A `changelog.md` file to log changes.

### Changed
- Change the default value of `[workingpaper]'` from `"WP"` to `""` since it seems unnecessary to highlight an article as working paper by default given that the journal name is already displayed.
