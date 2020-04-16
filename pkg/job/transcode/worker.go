package transcode

type worker struct {
	manager *manager
	jobType jobType
	stop    chan struct{}
}

func (w worker) Stop() {
	w.stop <- struct{}{}
}

func (w worker) Start() {
	for {
		select {
		case <-w.stop:
			return
		case j := <-w.manager.jobs[w.jobType]:
			w.manager.flight.Do(string(w.jobType)+":"+j.ID(), func() {
				err := w.jobType.Run(j)
				if err != nil {
					logger.Errorw(
						"transcode error",
						"error", err,
						"presentation", j,
						"type", w.jobType,
					)
				}
			})

		}
	}
}
