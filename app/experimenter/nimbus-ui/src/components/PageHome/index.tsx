/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useQuery } from "@apollo/client";
import { Link, RouteComponentProps } from "@reach/router";
import React, { useCallback } from "react";
import { Alert, Tab, Tabs } from "react-bootstrap";
import { GET_EXPERIMENTS_QUERY } from "../../gql/experiments";
import { useRefetchOnError, useSearchParamsState } from "../../hooks";
import { getAllExperiments_experiments } from "../../types/getAllExperiments";
import AppLayout from "../AppLayout";
import Head from "../Head";
import LinkExternal from "../LinkExternal";
import PageLoading from "../PageLoading";
import DirectoryTable, {
  DirectoryCompleteTable,
  DirectoryDraftsTable,
  DirectoryLiveTable,
} from "./DirectoryTable";
import sortByStatus from "./sortByStatus";

type PageHomeProps = Record<string, any> & RouteComponentProps;

export const Body = () => {
  const [searchParams, updateSearchParams] = useSearchParamsState();
  const { data, loading, error, refetch } = useQuery<{
    experiments: getAllExperiments_experiments[];
  }>(GET_EXPERIMENTS_QUERY);
  const ErrorAlert = useRefetchOnError(error, refetch);

  const selectedTab = searchParams.get("tab") || "live";
  const onSelectTab = useCallback(
    (nextTab) => updateSearchParams((params) => params.set("tab", nextTab)),
    [updateSearchParams],
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return ErrorAlert;
  }

  if (!data) {
    return <div>No experiments found.</div>;
  }

  const { live, complete, preview, review, draft } = sortByStatus(
    data.experiments,
  );
  return (
    <Tabs activeKey={selectedTab} onSelect={onSelectTab}>
      <Tab eventKey="live" title={`Live (${live.length})`}>
        <DirectoryLiveTable experiments={live} />
      </Tab>
      <Tab eventKey="review" title={`Review (${review.length})`}>
        <DirectoryTable experiments={review} />
      </Tab>
      <Tab eventKey="preview" title={`Preview (${preview.length})`}>
        <DirectoryTable experiments={preview} />
      </Tab>
      <Tab eventKey="completed" title={`Completed (${complete.length})`}>
        <DirectoryCompleteTable experiments={complete} />
      </Tab>
      <Tab eventKey="drafts" title={`Draft (${draft.length})`}>
        <DirectoryDraftsTable experiments={draft} />
      </Tab>
    </Tabs>
  );
};

const PageHome: React.FunctionComponent<PageHomeProps> = () => {
  return (
    <AppLayout testid="PageHome">
      <Head title="Experiments" />

      <div className="d-flex mb-4 justify-content-between">
        <h2 className="mb-0 mr-1">Nimbus Experiments </h2>
        <div>
          <Link
            to="new"
            data-sb-kind="pages/New"
            className="btn btn-primary btn-small ml-2"
            id="create-new-button"
          >
            Create new
          </Link>
        </div>
      </div>

      <Alert variant="primary" className="mb-4">
        <span role="img" aria-label="book emoji">
          📖
        </span>{" "}
        Not sure where to start? Check out the{" "}
        <LinkExternal href="https://experimenter.info">
          Experimenter documentation hub
        </LinkExternal>
        .
      </Alert>

      <Body />
    </AppLayout>
  );
};

export default PageHome;
