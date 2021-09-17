import React from "react";
import { Provider } from "react-redux";
import { reducer as form } from "redux-form";
import { render, screen, fireEvent } from "@testing-library/react";
import mock from "xhr-mock";

import SaveQuestionModal from "metabase/containers/SaveQuestionModal";
import Question from "metabase-lib/lib/Question";
import MetabaseSettings from "metabase/lib/settings";
import { PLUGIN_CACHING } from "metabase/plugins";

import {
  SAMPLE_DATASET,
  ORDERS,
  PEOPLE,
  metadata,
} from "__support__/sample_dataset_fixture";
import { getStore } from "__support__/entities-store";

function mockCachingEnabled(enabled = true) {
  const original = MetabaseSettings.get;
  const spy = jest.spyOn(MetabaseSettings, "get");
  spy.mockImplementation(key => {
    if (key === "enable-query-caching") {
      return enabled;
    }
    return original(key);
  });
}

const renderSaveQuestionModal = (question, originalQuestion) => {
  const store = getStore({ form });
  const onCreateMock = jest.fn(() => Promise.resolve());
  const onSaveMock = jest.fn(() => Promise.resolve());
  render(
    <Provider store={store}>
      <SaveQuestionModal
        card={question.card()}
        originalCard={originalQuestion && originalQuestion.card()}
        tableMetadata={question.table()}
        onCreate={onCreateMock}
        onSave={onSaveMock}
        onClose={() => {}}
      />
    </Provider>,
  );
  return { store, onSaveMock, onCreateMock };
};

describe("SaveQuestionModal", () => {
  const TEST_COLLECTIONS = [
    {
      can_write: false,
      effective_ancestors: [],
      effective_location: null,
      id: "root",
      name: "Our analytics",
      parent_id: null,
    },
    {
      archived: false,
      can_write: true,
      color: "#31698A",
      description: null,
      id: 1,
      location: "/",
      name: "Bobby Tables's Personal Collection",
      namespace: null,
      personal_owner_id: 1,
      slug: "bobby_tables_s_personal_collection",
    },
  ];

  beforeEach(() => {
    mock.setup();
    mock.get("/api/collection", {
      body: JSON.stringify(TEST_COLLECTIONS),
    });
  });

  afterEach(() => {
    mock.teardown();
  });

  it("should call onCreate correctly for a new question", async () => {
    const newQuestion = Question.create({
      databaseId: SAMPLE_DATASET.id,
      tableId: ORDERS.id,
      metadata,
    })
      .query()
      .aggregate(["count"])
      .question();

    // Use the count aggregation as an example case (this is equally valid for filters and groupings)
    const { onCreateMock } = renderSaveQuestionModal(newQuestion, null);

    fireEvent.click(screen.getByText("Save"));
    expect(onCreateMock).toHaveBeenCalledTimes(1);
  });

  it("should call onSave correctly for a dirty, saved question", async () => {
    const originalQuestion = Question.create({
      databaseId: SAMPLE_DATASET.id,
      tableId: ORDERS.id,
      metadata,
    })
      .query()
      .aggregate(["count"])
      .question();
    // "Save" the question
    originalQuestion.card.id = 5;

    const dirtyQuestion = originalQuestion
      .query()
      .breakout(["field", ORDERS.TOTAL.id, null])
      .question();

    // Use the count aggregation as an example case (this is equally valid for filters and groupings)
    const { onSaveMock } = renderSaveQuestionModal(
      dirtyQuestion,
      originalQuestion,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(onSaveMock).toHaveBeenCalledTimes(1);
  });

  it("should preserve the collection_id of a question in overwrite mode", async () => {
    let originalQuestion = Question.create({
      databaseId: SAMPLE_DATASET.id,
      tableId: PEOPLE.id,
      metadata,
    })
      .query()
      .aggregate(["count"])
      .question();

    // set the collection_id of the original question
    originalQuestion = originalQuestion.setCard({
      ...originalQuestion.card(),
      collection_id: 5,
    });

    const dirtyQuestion = originalQuestion
      .query()
      .breakout(["field", ORDERS.TOTAL.id, null])
      .question();

    const { onSaveMock } = renderSaveQuestionModal(
      dirtyQuestion,
      originalQuestion,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(onSaveMock.mock.calls[0][0].collection_id).toEqual(5);
  });

  describe("Cache TTL field", () => {
    beforeEach(() => {
      mockCachingEnabled();
    });

    const question = Question.create({
      databaseId: SAMPLE_DATASET.id,
      tableId: ORDERS.id,
      metadata,
    })
      .query()
      .aggregate(["count"])
      .question();

    describe("OSS", () => {
      it("is not shown", () => {
        renderSaveQuestionModal(question);
        expect(screen.queryByText("More options")).not.toBeInTheDocument();
        expect(
          screen.queryByText("Cache all question results for"),
        ).not.toBeInTheDocument();
      });
    });

    describe("EE", () => {
      beforeEach(() => {
        PLUGIN_CACHING.cacheTTLFormField = {
          name: "cache_ttl",
          type: "integer",
        };
      });

      afterEach(() => {
        PLUGIN_CACHING.cacheTTLFormField = null;
      });

      it("is not shown", () => {
        renderSaveQuestionModal(question);
        expect(screen.queryByText("More options")).not.toBeInTheDocument();
        expect(
          screen.queryByText("Cache all question results for"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
