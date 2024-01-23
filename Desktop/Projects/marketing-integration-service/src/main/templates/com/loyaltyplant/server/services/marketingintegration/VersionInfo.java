package com.loyaltyplant.server.services.marketingintegration;

import com.loyaltyplant.server.commons.utils.version.VersionInfoBuilder;

public class VersionInfo {
    public static class Git {
        public static final String BRANCH = "${git.branch}";
        public static final String TAGS = "${git.tags}";
        public static final String COMMIT_ID = "${git.commit.id}";
        public static final String COMMIT_TIME = "${git.commit.time}";
        public static final String COMMIT_ID_DESCRIBE = "${git.commit.id.describe}";
        public static final String COMMIT_MESSAGE_SHORT = "${git.commit.message.short}";
    }
    public static class Build {
        public static final String TIMESTAMP = "${maven.build.timestamp}";
        public static final String USER = "${user.name}";
        public static final String VERSION = Build.class.getPackage().getImplementationVersion();//take version from manifest
    }

    public static final com.loyaltyplant.server.commons.utils.version.VersionInfo INSTANCE = new VersionInfoBuilder()
            .setGitBranch(Git.BRANCH)
            .setGitTags(Git.TAGS)
            .setGitCommitId(Git.COMMIT_ID)
            .setGitCommitTime(Git.COMMIT_TIME)
            .setGitCommitIdDescribe(Git.COMMIT_ID_DESCRIBE)
            .setGitCommitMessageShort(Git.COMMIT_MESSAGE_SHORT)
            .setBuildTimestamp(Build.TIMESTAMP)
            .setBuildUser(Build.USER)
            .setBuildVersion(Build.VERSION)
            .build();
}