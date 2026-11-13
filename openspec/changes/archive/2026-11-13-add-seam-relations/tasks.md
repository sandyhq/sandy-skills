## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/check.test.mjs::check SHALL report bad-relation as an error when a Relation line names a value outside the 7 values of the glossary or an upstream that is neither part of its seam.`
- [x] 2.2 Prove `test/check.test.mjs::check SHALL report missing-relation as an error for a seam without a Relation line.`
- [x] 2.3 Prove `test/diagram.test.mjs::The diagram SHALL write the relation of each seam on its arrow.`

## 3. Build

- [x] 3.1 Relation line in parts and check; run `test/check.test.mjs`
- [x] 3.2 Relation on the arrow, Relation line on each seam of this repo; run the tests and `sandy-skills validate --all --strict`
