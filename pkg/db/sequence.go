package db

import (
	"sync"

	"github.com/dgraph-io/badger/v2"
)

var sequenceMap = map[Index]*badger.Sequence{}
var sequenceMapMu = new(sync.Mutex)
var sequenceBandwidth uint64 = 1000

// Sequence get integer sequence for a index.
func (index Index) Sequence() (ret *badger.Sequence, err error) {
	sequenceMapMu.Lock()
	defer sequenceMapMu.Unlock()
	ret, ok := sequenceMap[index]
	if !ok {
		ret, err = db.GetSequence(IndexSequence.Key(string(index.Bytes())), sequenceBandwidth)
		sequenceMap[index] = ret
	}
	return
}

// ReleaseSequences release all used index sequence
func ReleaseSequences() error {
	sequenceMapMu.Lock()
	defer sequenceMapMu.Unlock()
	for _, seq := range sequenceMap {
		err := seq.Release()
		if err != nil {
			return err
		}
	}
	return nil
}
